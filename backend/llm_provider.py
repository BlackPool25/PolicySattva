import os

import httpx
from dotenv import load_dotenv


load_dotenv()


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