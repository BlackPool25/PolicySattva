import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from lightrag import LightRAG, QueryParam
from lightrag.kg.neo4j_impl import Neo4JStorage as _Neo4JStorage

from document_loader import load_pdf
from llm_provider import get_embedding_func, get_llm_func


load_dotenv()


# ---------------------------------------------------------------------------
# Monkey-patch: semantic relationship types in Neo4j
#
# LightRAG hardcodes MERGE (source)-[r:DIRECTED]-(target) for every edge.
# The actual semantic relationship is in edge_data["keywords"] (e.g.
# "data sharing,privacy,consent"). This patch replaces the fixed DIRECTED
# type with the first keyword, normalised to UPPER_SNAKE_CASE, so the Neo4j
# graph shows meaningful edge labels (DATA_SHARING, GOVERNANCE, etc.).
#
# Relationship types in Cypher cannot be parameterised, so the type must be
# baked into the query string — hence the need for a patch rather than a
# query parameter.
# ---------------------------------------------------------------------------

def _keywords_to_rel_type(keywords: str) -> str:
    """Return a Neo4j-safe relationship type derived from the first keyword."""
    if not keywords:
        return "RELATED_TO"
    first_kw = keywords.split(",")[0].strip()
    sanitized = re.sub(r"[^a-zA-Z0-9 ]", "", first_kw)
    return sanitized.strip().upper().replace(" ", "_") or "RELATED_TO"


async def _semantic_upsert_edge(
    self: _Neo4JStorage,
    source_node_id: str,
    target_node_id: str,
    edge_data: dict,
) -> None:
    from lightrag.utils import logger

    rel_type = _keywords_to_rel_type(edge_data.get("keywords", ""))
    try:
        async with self._driver.session(database=self._DATABASE) as session:
            async def execute_upsert(tx):
                workspace_label = self._get_workspace_label()
                query = f"""
                MATCH (source:`{workspace_label}` {{entity_id: $source_entity_id}})
                WITH source
                MATCH (target:`{workspace_label}` {{entity_id: $target_entity_id}})
                MERGE (source)-[r:{rel_type}]-(target)
                SET r += $properties
                RETURN r, source, target
                """
                result = await tx.run(
                    query,
                    source_entity_id=source_node_id,
                    target_entity_id=target_node_id,
                    properties=edge_data,
                )
                try:
                    await result.fetch(2)
                finally:
                    await result.consume()

            await session.execute_write(execute_upsert)
    except Exception as exc:
        logger.error(f"[{self.workspace}] Semantic edge upsert failed: {exc}")
        raise


_Neo4JStorage.upsert_edge = _semantic_upsert_edge  # type: ignore[method-assign]

_RAG_STORAGE_DIR = str(Path(__file__).resolve().parent / "rag_storage")

# Appended to every query so the LLM returns structured metadata in a
# parseable block. Phase 2 reads risk_level, source_clauses, and
# graph_nodes_involved directly from the dict this function returns.
_ANALYSIS_PROMPT = """

After your answer, append this exact block — nothing after it:

[ANALYSIS]
{"risk_level": "HIGH|MEDIUM|LOW", "graph_nodes_involved": ["entity1", "entity2"], "source_clauses": [{"file": "filename.pdf", "excerpt": "exact quoted text from the document"}]}
[/ANALYSIS]

Rules:
- risk_level: HIGH = serious data/financial/legal risk; MEDIUM = moderate concern; LOW = routine clause.
- graph_nodes_involved: 2-5 key entity names from the document relevant to this answer.
- source_clauses: 1-3 direct verbatim quotes from the source document supporting your answer.
- Output valid JSON only inside the [ANALYSIS] block."""


def _resolve_neo4j_env() -> None:
    """Point NEO4J_* env vars at the first configured target (cloud → local).

    LightRAG's Neo4JStorage reads NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD /
    NEO4J_DATABASE directly from the environment. This function keeps that in
    sync with the same cloud-first fallback logic in neo4j_connection.py so
    both the healthcheck and LightRAG always reach the same database.
    """
    from neo4j_connection import _candidate_targets

    for target in _candidate_targets():
        if not target.password:
            continue
        os.environ["NEO4J_URI"] = target.uri
        os.environ["NEO4J_USERNAME"] = target.username
        os.environ["NEO4J_PASSWORD"] = target.password
        os.environ["NEO4J_DATABASE"] = target.database
        return
    raise RuntimeError(
        "No Neo4j target is configured. Set NEO4J_URI/PASSWORD or NEO4J_CLOUD_URI/PASSWORD in .env"
    )


def _build_rag() -> LightRAG:
    _resolve_neo4j_env()
    llm_func, llm_model_name = get_llm_func()
    embedding_func = get_embedding_func()
    return LightRAG(
        working_dir=_RAG_STORAGE_DIR,
        llm_model_func=llm_func,
        llm_model_name=llm_model_name,
        embedding_func=embedding_func,
        graph_storage="Neo4JStorage",
    )


def _parse_analysis_block(raw: str) -> dict[str, object]:
    """Extract and parse the [ANALYSIS] JSON block from the LLM response.

    Returns a dict with risk_level, graph_nodes_involved, source_clauses.
    Falls back to safe defaults if the block is absent or malformed.
    """
    match = re.search(r"\[ANALYSIS\](.*?)\[/ANALYSIS\]", raw, re.DOTALL)
    if not match:
        return {"risk_level": "UNKNOWN", "graph_nodes_involved": [], "source_clauses": []}
    try:
        parsed = json.loads(match.group(1).strip())
        return {
            "risk_level": parsed.get("risk_level", "UNKNOWN"),
            "graph_nodes_involved": parsed.get("graph_nodes_involved", []),
            "source_clauses": parsed.get("source_clauses", []),
        }
    except (json.JSONDecodeError, AttributeError):
        return {"risk_level": "UNKNOWN", "graph_nodes_involved": [], "source_clauses": []}


async def index_document(pdf_path: str) -> None:
    text, metadata = load_pdf(pdf_path)
    print(f"Indexing file={metadata['filename']} pages={metadata['page_count']} chars={len(text)}")

    rag = _build_rag()
    await rag.initialize_storages()
    try:
        await rag.ainsert(input=[text], file_paths=[pdf_path])
    finally:
        await rag.finalize_storages()


async def query(question: str) -> dict[str, object]:
    """Query the indexed documents and return a Phase 2-ready structured response.

    Returns:
        {
            "answer": str,
            "risk_level": "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN",
            "source_clauses": [{"file": str, "excerpt": str}],
            "graph_nodes_involved": [str],
        }
    """
    rag = _build_rag()
    await rag.initialize_storages()
    try:
        raw_response = await rag.aquery(
            question,
            param=QueryParam(
                mode="mix",
                only_need_context=False,
                user_prompt=_ANALYSIS_PROMPT,
            ),
        )
        raw_str = raw_response if isinstance(raw_response, str) else str(raw_response)
        answer = re.split(r"\[ANALYSIS\]", raw_str, maxsplit=1)[0].strip()
        structured = _parse_analysis_block(raw_str)
        return {
            "answer": answer,
            "risk_level": structured["risk_level"],
            "source_clauses": structured["source_clauses"],
            "graph_nodes_involved": structured["graph_nodes_involved"],
        }
    finally:
        await rag.finalize_storages()
