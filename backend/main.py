import logging
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import graph_service
import lightrag_engine


logger = logging.getLogger(__name__)


class QueryRequest(BaseModel):
    question: str
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


app = FastAPI(title="PolicySattva API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

indexing_status: dict[str, str] = {}


async def run_indexing(doc_id: str, saved_path: str) -> None:
    try:
        await lightrag_engine.index_document(saved_path)
        indexing_status[doc_id] = "ready"
    except Exception as exc:
        indexing_status[doc_id] = "failed"
        logger.exception("Indexing failed for %s: %s", doc_id, exc)


@app.post("/ingest", response_model=IngestResponse)
async def ingest(file: UploadFile, background_tasks: BackgroundTasks) -> IngestResponse:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF uploads are supported")
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must include a filename")

    documents_dir = Path(__file__).resolve().parent / "documents"
    documents_dir.mkdir(parents=True, exist_ok=True)

    doc_id = Path(file.filename).name
    saved_path = str(documents_dir / doc_id)

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

    indexing_status[doc_id] = "indexing"
    background_tasks.add_task(run_indexing, doc_id, saved_path)

    return IngestResponse(status="indexing", doc_id=doc_id, message="Indexing started")


@app.get("/ingest/status/{doc_id}", response_model=StatusResponse)
async def ingest_status(doc_id: str) -> StatusResponse:
    status = indexing_status.get(doc_id)
    if status is None:
        raise HTTPException(status_code=404, detail="Unknown doc_id")
    return StatusResponse(doc_id=doc_id, status=status)


@app.post("/query", response_model=QueryResponse)
async def query_endpoint(body: QueryRequest) -> QueryResponse:
    try:
        result = await lightrag_engine.query(body.question, doc_filter=body.doc_filter)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Query failed: {exc}") from exc

    source_clauses = [SourceClause(**clause) for clause in result.get("source_clauses", [])]

    return QueryResponse(
        answer=str(result.get("answer", "")),
        risk_level=str(result.get("risk_level", "UNKNOWN")),
        source_clauses=source_clauses,
        graph_nodes_involved=[str(node) for node in result.get("graph_nodes_involved", [])],
    )


@app.get("/graph", response_model=GraphResponse)
async def graph_endpoint() -> GraphResponse:
    graph = await graph_service.get_full_graph()
    return GraphResponse(**graph)


@app.get("/graph/subgraph", response_model=GraphResponse)
async def graph_subgraph_endpoint(nodes: str) -> GraphResponse:
    node_ids = [node.strip() for node in nodes.split(",") if node.strip()]
    graph = await graph_service.get_subgraph(node_ids)
    return GraphResponse(**graph)


@app.get("/graph/node/{node_id}", response_model=GraphNodeDetail)
async def graph_node_detail_endpoint(node_id: str) -> GraphNodeDetail:
    try:
        detail = await graph_service.get_node_details(node_id)
        return GraphNodeDetail(**detail)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch node details: {exc}") from exc