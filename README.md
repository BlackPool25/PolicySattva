# Legal Document Demystifier

Phase 0 scaffold for a local-first legal document analysis app.

## Monorepo Layout

- backend/: Python backend services and scripts
- frontend/: React + TypeScript + Vite frontend

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm
- Neo4j Desktop (local DB available at localhost:7474)
- Ollama

## Setup

1. Backend environment and packages are installed in `.venv`.
2. Frontend app is scaffolded with Vite React TypeScript.
3. Root `.env` contains required placeholders.

## Verify Phase 0

Backend import check:

```bash
/home/lightdesk/Projects/policy-ai/.venv/bin/python -c "from lightrag import LightRAG; print('ok')"
```

Frontend dev server:

```bash
cd frontend && npm run dev
```

Neo4j browser:

- Open http://localhost:7474

Ollama embedding model:

```bash
ollama pull nomic-embed-text
```
