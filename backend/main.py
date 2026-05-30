import logging
import json
import os
import re
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import graph_service
import lightrag_engine
from llm_provider import get_active_rag_storage_dir


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Pydantic models — response shapes are a frontend contract, do not alter.
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    question: str
    company_id: str
    doc_filter: str | None = None


class SourceClause(BaseModel):
    file: str
    excerpt: str


class QueryResponse(BaseModel):
    answer: str
    risk_level: str
    source_clauses: list[SourceClause]
    graph_nodes_involved: list[str]


class IngestResponse(BaseModel):
    status: str
    doc_id: str
    message: str


class StatusResponse(BaseModel):
    doc_id: str
    status: str


class DocumentListItem(BaseModel):
    id: str          # LightRAG internal doc key, e.g. "doc-abc123"
    name: str        # filename, e.g. "telegram_tos.pdf"
    status: str      # ready | indexing | failed
    company_id: str  # which company this belongs to


class DeleteDocumentResponse(BaseModel):
    deleted: bool
    doc_id: str
    company_id: str


class GraphNode(BaseModel):
    id: str
    label: str
    type: str


class GraphEdge(BaseModel):
    source: str
    target: str
    label: str


class GraphStats(BaseModel):
    node_count: int
    edge_count: int


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    stats: GraphStats


class GraphNodeDetail(BaseModel):
    id: str
    label: str
    description: str
    type: str
    source_files: list[str]


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(title="PolicySattva API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory status for in-flight indexing jobs: key = "<company_id>/<doc_filename>"
indexing_status: dict[str, str] = {}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_company_id(raw: str) -> str:
    """Sanitise company_id to a filesystem-safe slug."""
    slug = re.sub(r"[^a-zA-Z0-9_-]", "_", raw.strip()).strip("_")
    if not slug:
        raise HTTPException(status_code=400, detail="company_id must not be empty")
    return slug.lower()


def _normalize_doc_status(raw: str | None) -> str:
    normalized = (raw or "").strip().lower()
    if normalized in {"processed", "ready", "completed"}:
        return "ready"
    if normalized in {"processing", "indexing", "running"}:
        return "indexing"
    if normalized in {"failed", "error"}:
        return "failed"
    return "indexing"


def _safe_load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _load_documents_for_company(company_id: str) -> list[DocumentListItem]:
    """Load all indexed documents for a single company from its storage dir.

    LightRAG stores files at <base_dir>/<company_id>/ when workspace=company_id.
    """
    company_dir = get_active_rag_storage_dir() / company_id
    full_docs = _safe_load_json(company_dir / "kv_store_full_docs.json")
    doc_status = _safe_load_json(company_dir / "kv_store_doc_status.json")
    docs: list[DocumentListItem] = []

    for doc_key, doc_data in full_docs.items():
        if not isinstance(doc_data, dict):
            continue
        file_path = str(doc_data.get("file_path", "")).strip()
        if not file_path:
            continue
        doc_name = Path(file_path).name
        status_data = doc_status.get(doc_key, {}) if isinstance(doc_status, dict) else {}
        status = _normalize_doc_status(
            status_data.get("status") if isinstance(status_data, dict) else None
        )
        docs.append(DocumentListItem(id=doc_key, name=doc_name, status=status, company_id=company_id))

    # Overlay in-flight status for this company
    for key, status in indexing_status.items():
        comp_id, doc_name = key.split("/", 1) if "/" in key else ("unknown", key)
        if comp_id != company_id:
            continue
        # Find and update existing entry or add a placeholder
        for doc in docs:
            if doc.name == doc_name:
                doc.status = _normalize_doc_status(status)
                break
        else:
            docs.append(DocumentListItem(
                id=doc_name,
                name=doc_name,
                status=_normalize_doc_status(status),
                company_id=company_id,
            ))

    return docs


def _load_all_documents() -> list[DocumentListItem]:
    """Scan all company subdirs under the active embedding namespace."""
    base = get_active_rag_storage_dir()
    if not base.exists():
        return []

    all_docs: list[DocumentListItem] = []
    for company_dir in sorted(base.iterdir()):
        if not company_dir.is_dir():
            continue
        company_id = company_dir.name
        all_docs.extend(_load_documents_for_company(company_id))

    # Overlay in-flight status
    for key, status in indexing_status.items():
        company_id, doc_name = key.split("/", 1) if "/" in key else ("unknown", key)
        # Find and update existing entry or add a placeholder
        for doc in all_docs:
            if doc.company_id == company_id and doc.name == doc_name:
                doc.status = _normalize_doc_status(status)
                break
        else:
            all_docs.append(DocumentListItem(
                id=doc_name,
                name=doc_name,
                status=_normalize_doc_status(status),
                company_id=company_id,
            ))

    return all_docs


async def _run_indexing(company_id: str, doc_id: str, saved_path: str) -> None:
    status_key = f"{company_id}/{doc_id}"
    try:
        await lightrag_engine.index_document(saved_path, company_id)
        indexing_status[status_key] = "ready"
    except Exception as exc:
        indexing_status[status_key] = "failed"
        logger.exception("Indexing failed company=%s doc=%s: %s", company_id, doc_id, exc)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/ingest", response_model=IngestResponse)
async def ingest(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    company_id: str = Form(...),
) -> IngestResponse:
    """Upload a PDF and index it under the given company workspace.

    The company_id isolates this document from all other companies.
    Re-uploading the same file to the same company is a safe no-op (deduped by LightRAG).
    Re-uploading to a different company creates an independent copy in that workspace.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF uploads are supported")
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must include a filename")

    safe_company = _safe_company_id(company_id)

    documents_dir = Path(__file__).resolve().parent / "documents" / safe_company
    documents_dir.mkdir(parents=True, exist_ok=True)

    doc_id = Path(file.filename).name
    saved_path = str(documents_dir / doc_id)
    status_key = f"{safe_company}/{doc_id}"

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded PDF is empty")
        with open(saved_path, "wb") as out_file:
            out_file.write(content)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to store uploaded file: {exc}") from exc
    finally:
        await file.close()

    indexing_status[status_key] = "indexing"
    background_tasks.add_task(_run_indexing, safe_company, doc_id, saved_path)

    return IngestResponse(status="indexing", doc_id=doc_id, message=f"Indexing started for company '{safe_company}'")


@app.get("/ingest/status/{company_id}/{doc_id}", response_model=StatusResponse)
async def ingest_status(company_id: str, doc_id: str) -> StatusResponse:
    safe_company = _safe_company_id(company_id)
    status_key = f"{safe_company}/{doc_id}"

    if status_key in indexing_status:
        return StatusResponse(doc_id=doc_id, status=_normalize_doc_status(indexing_status[status_key]))

    for doc in _load_documents_for_company(safe_company):
        if doc.name == doc_id:
            return StatusResponse(doc_id=doc_id, status=doc.status)

    raise HTTPException(status_code=404, detail="Unknown doc_id for this company")


@app.get("/documents", response_model=list[DocumentListItem])
async def list_documents_endpoint(company_id: str | None = None) -> list[DocumentListItem]:
    """List all indexed documents. Pass ?company_id=<id> to filter by company."""
    if company_id:
        return _load_documents_for_company(_safe_company_id(company_id))
    return _load_all_documents()


@app.get("/workspaces", response_model=list[str])
async def get_workspaces_endpoint() -> list[str]:
    """List all active company/workspace IDs that have indexed directories on disk."""
    base = get_active_rag_storage_dir()
    if not base.exists():
        return ["default_company"]

    companies = [f.name for f in base.iterdir() if f.is_dir()]
    if "default_company" not in companies:
        companies.insert(0, "default_company")
    return sorted(list(set(companies)))


@app.delete("/documents/{company_id}/{doc_id}", response_model=DeleteDocumentResponse)
async def delete_document_endpoint(company_id: str, doc_id: str) -> DeleteDocumentResponse:
    """Remove a document from a company's workspace.

    doc_id must be the LightRAG internal key (e.g. 'doc-abc123...').
    This removes the document's chunks, graph nodes, and vector embeddings.
    Other documents in the same company are unaffected.
    """
    safe_company = _safe_company_id(company_id)
    deleted = await lightrag_engine.delete_document(doc_id, safe_company)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found in company '{safe_company}'")
    # Clean up in-memory status if present
    indexing_status.pop(f"{safe_company}/{doc_id}", None)
    return DeleteDocumentResponse(deleted=True, doc_id=doc_id, company_id=safe_company)


@app.post("/query", response_model=QueryResponse)
async def query_endpoint(body: QueryRequest) -> QueryResponse:
    safe_company = _safe_company_id(body.company_id)
    try:
        result = await lightrag_engine.query(body.question, safe_company, doc_filter=body.doc_filter)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Query failed: {exc}") from exc

    source_clauses = [SourceClause(**clause) for clause in result.get("source_clauses", [])]
    return QueryResponse(
        answer=str(result.get("answer", "")),
        risk_level=str(result.get("risk_level", "UNKNOWN")),
        source_clauses=source_clauses,
        graph_nodes_involved=[str(n) for n in result.get("graph_nodes_involved", [])],
    )


@app.get("/graph", response_model=GraphResponse)
async def graph_endpoint(company_id: str, doc_filter: str | None = None) -> GraphResponse:
    safe_company = _safe_company_id(company_id)
    graph = await graph_service.get_full_graph_for_doc(doc_filter, company_id=safe_company)
    return GraphResponse(**graph)


@app.get("/graph/subgraph", response_model=GraphResponse)
async def graph_subgraph_endpoint(
    nodes: str,
    company_id: str,
    doc_filter: str | None = None,
) -> GraphResponse:
    safe_company = _safe_company_id(company_id)
    node_ids = [n.strip() for n in nodes.split(",") if n.strip()]
    graph = await graph_service.get_subgraph_for_doc(node_ids, doc_filter=doc_filter, company_id=safe_company)
    return GraphResponse(**graph)


@app.get("/graph/node/{node_id}", response_model=GraphNodeDetail)
async def graph_node_detail_endpoint(node_id: str) -> GraphNodeDetail:
    try:
        detail = await graph_service.get_node_details(node_id)
        return GraphNodeDetail(**detail)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch node details: {exc}") from exc


class ProviderSettings(BaseModel):
    mode: str
    primary_llm_provider: str
    embed_provider: str
    query_model: str
    embedding_model: str
    embedding_dim: int
    requires_reindex: bool
    warning: str | None = None


class UpdateSettingsRequest(BaseModel):
    use_local_ollama: bool
    query_model: str
    embedding_model: str
    embedding_dim: int


@app.get("/settings/provider", response_model=ProviderSettings)
async def get_settings_provider() -> ProviderSettings:
    primary = os.getenv("PRIMARY_LLM_PROVIDER", "gemini").lower()
    embed = os.getenv("EMBED_PROVIDER", "gemini").lower()
    mode = "local_ollama" if (primary == "ollama" or embed == "ollama") else "cloud"
    
    return ProviderSettings(
        mode=mode,
        primary_llm_provider=primary,
        embed_provider=embed,
        query_model=os.getenv("OLLAMA_LLM_MODEL", "qwen3:8b") if primary == "ollama" else "gemini-2.5-flash-lite",
        embedding_model=os.getenv("OLLAMA_EMBED_MODEL", "qwen3-embedding:8b") if embed == "ollama" else "gemini-embedding-2-preview",
        embedding_dim=int(os.getenv("OLLAMA_EMBED_DIM", "4096")) if embed == "ollama" else 3072,
        requires_reindex=False,
        warning=None
    )


@app.post("/settings/provider", response_model=ProviderSettings)
async def set_settings_provider(body: UpdateSettingsRequest) -> ProviderSettings:
    if body.use_local_ollama:
        os.environ["PRIMARY_LLM_PROVIDER"] = "ollama"
        os.environ["EMBED_PROVIDER"] = "ollama"
    else:
        # Revert to standard cloud config
        os.environ["PRIMARY_LLM_PROVIDER"] = "gemini"
        os.environ["EMBED_PROVIDER"] = "gemini"
    
    return await get_settings_provider()
