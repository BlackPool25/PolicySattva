# Legal Document Demystifier

Phase 0 scaffold for a local-first legal document analysis app.

## Monorepo Layout

- backend/: Python backend services and scripts
- frontend/: React + TypeScript + Vite frontend

## Prerequisites

- Python 3.11+
- Node.js 20+
- bun
- Neo4j Desktop (local DB available at localhost:7474)
- Ollama

## Setup

1. Backend environment and packages are installed in `.venv`.
2. Frontend app is scaffolded with Vite React TypeScript.
3. Root `.env` contains required placeholders.

## Verify Phase 0

Backend import check:

```bash
python -c "from lightrag import LightRAG; print('ok')"
```

Frontend dev server:

```bash
cd frontend && bun install && bun run dev
```

Neo4j browser:

- Open http://localhost:7474

Ollama embedding model:

```bash
ollama pull nomic-embed-text
```

## Phase 1 (LightRAG Core)

Install backend dependencies with `uv`:

```bash
uv pip install -r backend/requirements.txt
```

Create a documents directory and place at least one PDF (for example `truecaller_tos.pdf`):

```bash
mkdir -p backend/documents
```

Run the Phase 1 smoke test:

```bash
cd backend && python smoke_test.py
```

## Phase 2 (FastAPI Backend)

Install backend dependencies with `uv`:

```bash
uv pip install -r backend/requirements.txt
```

Start the API server:

```bash
cd backend && uvicorn main:app --reload --port 8000
```

Test endpoints with `curl`:

```bash
# Ingest
curl -X POST http://localhost:8000/ingest \
	-F "file=@documents/truecaller_tos.pdf"

# Poll indexing status
curl http://localhost:8000/ingest/status/truecaller_tos.pdf

# Query
curl -X POST http://localhost:8000/query \
	-H "Content-Type: application/json" \
	-d '{"question": "Does Truecaller share my contacts?", "doc_filter": null}'

# Full graph
curl http://localhost:8000/graph

# Subgraph for specific nodes
curl "http://localhost:8000/graph/subgraph?nodes=data_sharing,third_party,contacts"
```
