# PolicySattva — Legal Document Demystifier

A local-first, demo-ready web application that reads complex legal documents (Terms of Service, privacy policies, rental agreements) and makes them understandable. Upload a PDF, ask questions in plain English, get back a risk-rated answer with source clauses, and explore the knowledge graph.

## Monorepo Layout

```
project/
├── backend/
│   ├── main.py              # FastAPI app — all endpoints
│   ├── llm_provider.py      # ALL LLM/embedding provider logic
│   ├── lightrag_engine.py   # LightRAG init, index_document(), query()
│   ├── graph_service.py     # Neo4j queries for graph export
│   ├── document_loader.py   # PyMuPDF PDF → clean text
│   └── documents/           # Pre-downloaded Indian ToS PDFs
└── frontend/
    └── src/
        ├── pages/
        │   ├── Home.tsx       # Landing / hero page
        │   ├── Landing.tsx    # Upload + status polling (route: /upload)
        │   ├── Chat.tsx       # Query + risk badges + citations (route: /chat)
        │   └── KnowledgeGraph.tsx  # Force graph visualization (route: /graph)
        ├── components/
        │   └── Layout.tsx     # Top nav: Home / Upload / Chat / Graph
        └── store/
            └── useAppStore.ts # Zustand global state (in lib/utils.ts)
```

## Prerequisites

- Python 3.11+
- `uv` (Python package manager)
- `bun` (JavaScript runtime / package manager)
- Neo4j Desktop (local DB at `localhost:7687`) or Neo4j Aura (set `NEO4J_CLOUD_URI` in `.env`)
- Groq API key and/or Google Gemini API key

## Environment Setup

Copy `.env` and fill in your keys:

```bash
# backend/.env (or project root .env)
PRIMARY_LLM_PROVIDER=groq        # or gemini / ollama
GROQ_API_KEY=...
GEMINI_API_KEY=...

NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=...
NEO4J_DATABASE=neo4j

EMBED_PROVIDER=gemini             # gemini (3072-dim) or ollama (1024-dim)
```

## Running the Full Stack

**Backend:**

```bash
uv pip install -r backend/requirements.txt
cd backend && uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend && bun install && bun run dev
```

Open http://localhost:5173 — navigation: Home → Upload → Chat → Graph.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/ingest` | Upload PDF; returns `{doc_id, status: "indexing"}` |
| `GET` | `/ingest/status/{doc_id}` | Poll indexing status: `indexing \| ready \| failed` |
| `POST` | `/query` | Ask a question; returns answer + risk level + source clauses + graph nodes |
| `GET` | `/graph` | Full graph (capped at 300 nodes) |
| `GET` | `/graph/subgraph?nodes=a,b` | 1-hop subgraph for given node IDs |
| `GET` | `/graph/node/{node_id}` | Entity detail: description, type, source hints |

Test with `curl`:

```bash
# Ingest
curl -X POST http://localhost:8000/ingest \
  -F "file=@backend/documents/truecaller_tos.pdf"

# Poll status
curl http://localhost:8000/ingest/status/truecaller_tos.pdf

# Query (with doc filter)
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Does Truecaller share my contacts?", "doc_filter": "truecaller_tos.pdf"}'

# Full graph
curl http://localhost:8000/graph

# Subgraph
curl "http://localhost:8000/graph/subgraph?nodes=data_sharing,third_party,contacts"

# Node detail
curl "http://localhost:8000/graph/node/data_sharing"
```

## Demo Flow

1. **Upload** — go to `/upload`, drop a PDF, watch it transition from 🟡 Indexing → 🟢 Ready
2. **Chat** — go to `/chat`, select the document in the left panel, ask a question
3. **Graph** — click "View in Graph" on any assistant message to see the highlighted subgraph; click any node for its description

## Pre-Indexed Documents

The store initialises with `truecaller_tos.pdf`, `phonepe_terms.pdf`, and `paytm_terms.pdf` marked as `ready`. Place the actual PDFs in `backend/documents/` and run the indexing script before the demo:

```bash
cd backend && python index_documents.py
```

## Phase History

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Environment scaffold | ✅ |
| 1 | LightRAG core (Python script) | ✅ |
| 2 | FastAPI endpoints | ✅ |
| 3 | React frontend — all 3 screens connected | ✅ |
| 4 | Pre-index demo documents | ⏳ |
| 5 | Integration & demo hardening | ⏳ |
