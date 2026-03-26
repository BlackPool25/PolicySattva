import os
from collections.abc import Awaitable, Callable

import httpx
import numpy as np
from dotenv import load_dotenv
from lightrag.llm.gemini import gemini_embed, gemini_model_complete
from lightrag.llm.ollama import ollama_embed, ollama_model_complete
from lightrag.llm.openai import openai_complete_if_cache
from lightrag.utils import wrap_embedding_func_with_attrs


load_dotenv()

# --- Model constants ---
GEMINI_MODEL_NAME = "gemini-flash-latest"
GEMINI_EMBED_MODEL = "gemini-embedding-2-preview"
GEMINI_EMBED_DIM = 3072  # gemini-embedding-2-preview output dimension

GROQ_MODEL_NAME = "meta-llama/llama-4-scout-17b-16e-instruct"
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

OLLAMA_EMBED_MODEL = "qwen3-embedding:0.6b"  # 1024-dim max (0.6B variant)
OLLAMA_EMBED_DIM = 1024                       # 8B variant supports 4096
DEFAULT_OLLAMA_LLM_MODEL = "qwen2.5:32b"


# ---------------------------------------------------------------------------
# API key verification helpers (used by healthcheck.py)
# ---------------------------------------------------------------------------

async def verify_groq_api_key(timeout_seconds: float = 15.0) -> tuple[bool, str]:
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        return False, "GROQ_API_KEY is empty"

    url = "https://api.groq.com/openai/v1/models"
    headers = {"Authorization": f"Bearer {api_key}"}

    try:
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            response = await client.get(url, headers=headers)

        if response.status_code == 200:
            return True, "Groq key accepted"

        return False, f"Groq verification failed with HTTP {response.status_code}: {response.text[:200]}"
    except Exception as exc:
        return False, f"Groq verification error: {exc}"


async def verify_gemini_api_key(timeout_seconds: float = 15.0) -> tuple[bool, str]:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return False, "GEMINI_API_KEY is empty"

    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

    try:
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            response = await client.get(url)

        if response.status_code == 200:
            return True, "Gemini key accepted"

        return False, f"Gemini verification failed with HTTP {response.status_code}: {response.text[:200]}"
    except Exception as exc:
        return False, f"Gemini verification error: {exc}"


# ---------------------------------------------------------------------------
# Embedding — provider selected at startup, NOT switched at runtime.
#
# IMPORTANT: embedding dimensions differ by provider. Once the first document
# is indexed, the dimension is locked to the vector DB. Switching providers
# requires deleting rag_storage/ and re-indexing everything.
#
#   EMBED_PROVIDER=gemini  → gemini-embedding-2-preview, 3072-dim  (default)
#   EMBED_PROVIDER=ollama  → nomic-embed-text,            768-dim
# ---------------------------------------------------------------------------

def get_embedding_func() -> Callable[[list[str]], Awaitable[np.ndarray]]:
    """Return a LightRAG-compatible embedding function.

    The provider (and therefore vector dimension) is chosen once at startup
    via the EMBED_PROVIDER env var. Mixing providers across runs corrupts the
    index — delete rag_storage/ before switching.
    """
    embed_provider = os.getenv("EMBED_PROVIDER", "gemini").strip().lower()
    gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
    ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").strip()

    if embed_provider == "ollama":
        # qwen3-embedding:0.6b supports 32–1024 dims (pull with: ollama pull qwen3-embedding:0.6b)
        # Switch to qwen3-embedding:8b for 4096-dim quality at the cost of RAM.
        @wrap_embedding_func_with_attrs(
            embedding_dim=OLLAMA_EMBED_DIM,
            max_token_size=8192,
            model_name=OLLAMA_EMBED_MODEL,
        )
        async def embedding_func_ollama(texts: list[str]) -> np.ndarray:
            try:
                return await ollama_embed.func(
                    texts,
                    embed_model=OLLAMA_EMBED_MODEL,
                    host=ollama_base_url,
                )
            except Exception as exc:
                raise RuntimeError(f"Ollama embedding failed: {exc}") from exc

        return embedding_func_ollama

    # Default: Gemini gemini-embedding-2-preview
    @wrap_embedding_func_with_attrs(
        embedding_dim=GEMINI_EMBED_DIM,
        max_token_size=2048,
        model_name=GEMINI_EMBED_MODEL,
    )
    async def embedding_func_gemini(texts: list[str]) -> np.ndarray:
        try:
            return await gemini_embed.func(
                texts,
                api_key=gemini_api_key,
                model=GEMINI_EMBED_MODEL,
            )
        except Exception as exc:
            raise RuntimeError(
                f"Gemini embedding failed: {exc}. "
                f"To use local Ollama instead, set EMBED_PROVIDER=ollama in .env "
                f"and delete backend/rag_storage/ before re-indexing."
            ) from exc

    return embedding_func_gemini


# ---------------------------------------------------------------------------
# LLM — Gemini → Groq (Llama 4 Scout) → Ollama fallback chain
# ---------------------------------------------------------------------------

def get_llm_func() -> tuple[Callable[..., Awaitable[str]], str]:
    """Return (llm_async_callable, primary_model_name) based on PRIMARY_LLM_PROVIDER.

    Provider priority maps:
      gemini → groq → ollama
      groq   → gemini → ollama
      ollama → gemini → groq
    """
    primary_provider = os.getenv("PRIMARY_LLM_PROVIDER", "gemini").strip().lower()
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
    ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").strip()
    ollama_llm_model = os.getenv("OLLAMA_LLM_MODEL", DEFAULT_OLLAMA_LLM_MODEL).strip()

    provider_priority_map: dict[str, list[str]] = {
        "gemini": ["gemini", "groq", "ollama"],
        "groq":   ["groq", "gemini", "ollama"],
        "ollama": ["ollama", "gemini", "groq"],
    }

    if primary_provider not in provider_priority_map:
        raise ValueError(
            f"PRIMARY_LLM_PROVIDER must be one of 'gemini', 'groq', or 'ollama'. Got: {primary_provider!r}"
        )

    async def call_gemini(
        prompt: str,
        system_prompt: str | None,
        history_messages: list[dict],
        keyword_extraction: bool,
        **kwargs: object,
    ) -> str:
        try:
            return await gemini_model_complete(
                prompt,
                system_prompt=system_prompt,
                history_messages=history_messages,
                keyword_extraction=keyword_extraction,
                api_key=gemini_api_key,
                model_name=GEMINI_MODEL_NAME,
                **kwargs,
            )
        except Exception as exc:
            raise RuntimeError(f"Gemini completion failed: {exc}") from exc

    async def call_groq(
        prompt: str,
        system_prompt: str | None,
        history_messages: list[dict],
        keyword_extraction: bool,
        **kwargs: object,
    ) -> str:
        try:
            return await openai_complete_if_cache(
                GROQ_MODEL_NAME,
                prompt,
                system_prompt=system_prompt,
                history_messages=history_messages,
                keyword_extraction=keyword_extraction,
                api_key=groq_api_key,
                base_url=GROQ_BASE_URL,
                **kwargs,
            )
        except Exception as exc:
            raise RuntimeError(f"Groq completion failed: {exc}") from exc

    async def call_ollama(
        prompt: str,
        system_prompt: str | None,
        history_messages: list[dict],
        keyword_extraction: bool,
        **kwargs: object,
    ) -> str:
        # ollama_model_complete reads the model name from
        # kwargs["hashing_kv"].global_config["llm_model_name"] — do NOT pass
        # model_name here or the ollama client will reject it.
        try:
            return await ollama_model_complete(
                prompt,
                system_prompt=system_prompt,
                history_messages=history_messages,
                keyword_extraction=keyword_extraction,
                host=ollama_base_url,
                **kwargs,
            )
        except Exception as exc:
            raise RuntimeError(f"Ollama completion failed: {exc}") from exc

    providers: dict[str, Callable[..., Awaitable[str]]] = {
        "gemini": call_gemini,
        "groq":   call_groq,
        "ollama": call_ollama,
    }

    async def llm_model_func(
        prompt: str,
        system_prompt: str | None = None,
        history_messages: list[dict] | None = None,
        keyword_extraction: bool = False,
        **kwargs: object,
    ) -> str:
        messages = history_messages if history_messages is not None else []
        ordered = provider_priority_map[primary_provider]
        errors: list[str] = []

        for name in ordered:
            try:
                return await providers[name](
                    prompt, system_prompt, messages, keyword_extraction, **kwargs
                )
            except Exception as exc:
                errors.append(f"{name}: {exc}")

        raise RuntimeError(
            f"All LLM providers failed {ordered}: " + " | ".join(errors)
        )

    model_name_by_provider = {
        "gemini": GEMINI_MODEL_NAME,
        "groq":   GROQ_MODEL_NAME,
        "ollama": ollama_llm_model,
    }
    return llm_model_func, model_name_by_provider[primary_provider]
