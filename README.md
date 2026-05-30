# 📜 PolicySattva — Legal Document Demystifier

PolicySattva is a premium, local-first web application designed to translate complex, hostile legal agreements (Terms of Service, rental contracts, privacy policies) into human-readable covenants. 

Developed in a gorgeous **Medieval Manuscript and Prehistoric Cave Mural Art** theme, users can upload a PDF, calculate risk indices, inspect highlighted citations, and navigate an interactive knowledge relation graph of entities on a visual parchment canvas.

---

## ✨ Features & Design Aesthetics
1. **Ancient Parchment Theme**: Displays cards and containers as sheets of raised papyrus (`#F4F0E6`/`#FBF9F4`) with vintage charcoal ink and decorative corner flourishes.
2. **Prehistoric Cave Mural SVGs**: Dual artistic margins depicting pre-historical figures holding ancient books and manuscripts, giving the application a rich, atmospheric layout.
3. **Neon Lime Highlights**: Bright neon highlights (`#84CC16`/`bg-lime-500`) for active states, scanning progress, and safety alerts.
4. **Isolated Company Workspaces**: Fully distinct, isolated workspaces driven by `company_id` so documents, vector namespaces, and Neo4j relations are kept segregated.
5. **No-Thinking Inferences**: Instructs Ollama and API LLMs via robust system directives to bypass internal thought logs and `<think>` tags, returning clean plain English answers directly.
6. **Turnkey Docker Compose**: Single-command startup containerizing the React SPA frontend, the FastAPI server, and a local Neo4j graph database.

---

## 📂 System Architecture & Layout

```
project/
├── backend/
│   ├── main.py              # FastAPI server (includes graph & dynamic settings)
│   ├── llm_provider.py      # LLM completion & embedding logic (with no-think guidelines)
│   ├── lightrag_engine.py   # LightRAG instances & indexing workflows
│   ├── graph_service.py     # Isolated Cypher queries to local/cloud Neo4j
│   ├── document_loader.py   # PDF text extraction
│   └── Dockerfile           # Backend container setup powered by UV
├── frontend/
│   ├── nginx.conf           # SPA route redirects for compiled distribution
│   ├── Dockerfile           # Multi-stage Bun compile + Nginx delivery
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx            # Prehistoric hero layout
│       │   ├── Landing.tsx         # Ingest drop zones & status grids
│       │   ├── Chat.tsx            # Parchment cards, risk tags, & source excerpts
│       │   └── KnowledgeGraph.tsx  # Radial force relations on sepia map
│       └── components/
│           └── Layout.tsx          # Collapsible parchment selector & progress meters
└── docker-compose.yml       # Production-ready orchestrator
```

---

## ⚙️ Environment Variables

Create a `.env` in the root folder before starting. All parameters are fully runtime-configurable:

```bash
# LLM Providers Configuration (Default to Ollama local-first)
PRIMARY_LLM_PROVIDER=ollama         # Options: 'ollama' | 'gemini' | 'groq'
EMBED_PROVIDER=ollama              # Options: 'ollama' | 'gemini'
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_LLM_MODEL=qwen3:8b
OLLAMA_EMBED_MODEL=qwen3-embedding:8b
OLLAMA_EMBED_DIM=4096
OLLAMA_NUM_CTX=32768              # Context window for Ollama. Must be set — Ollama's default (~2048) truncates LightRAG's entity extraction prompts and causes parse failures. 32768 is safe for qwen3:8b; increase VRAM usage is expected.

# Thinking / Reasoning Inference Toggle
INFERENCE_THINKING_MODE=false      # Set to 'false' to disable reasoning thought-logs

# Cloud Provider API Keys (Fallback ready)
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIzaSy...

# Neo4j Graph Database Configurations
NEO4J_TARGET=cloud                 # Options: 'cloud' | 'local'
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_local_password
NEO4J_DATABASE=neo4j

# Neo4j Aura Cloud Database Setup
NEO4J_CLOUD_URI=neo4j+s://141e46a1.databases.neo4j.io
NEO4J_CLOUD_USERNAME=b42c616e
NEO4J_CLOUD_PASSWORD=a3X_GNL0DDsbgMNeJoRUsBMUwnWpZ90WTQctIMZNM2A
NEO4J_CLOUD_DATABASE=neo4j
```

---

## 🐳 Running with Docker Compose

Ensure Docker and Docker Compose are installed on your machine. Launch the entire stack in one command:

```bash
docker compose up --build
```

*   **Frontend SPA Console**: Available at [http://localhost:3000](http://localhost:3000)
*   **FastAPI backend**: Resides at [http://localhost:8000](http://localhost:8000)
*   **Neo4j Console**: Operational at [http://localhost:7474](http://localhost:7474)

---

## 🛠️ Running Locally (Without Docker)

### 1. Start the Backend
Install `uv` python compiler, setup dependencies, and launch FastAPI:
```bash
pip install uv
uv pip install -r backend/requirements.txt
cd backend
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend
Install `bun` JavaScript engine, configure dependencies, and activate development server:
```bash
cd frontend
bun install
bun run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔗 Scoped API Endpoints

| Method | Path | Payload | Scoped Details |
| :--- | :--- | :--- | :--- |
| `POST` | `/ingest` | `file`, `company_id` (Form) | Index PDF isolated under company. |
| `GET` | `/ingest/status/{company}/{doc}` | Path variables | Check document parsing state. |
| `GET` | `/documents` | `?company_id={id}` (Query) | Load isolated document listings. |
| `DELETE`| `/documents/{company}/{doc}` | Path variables | Wipe segment chunks & graph nodes. |
| `POST` | `/query` | `question`, `company_id`, `doc_filter` | Query covenants with isolated citations. |
| `GET` | `/graph` | `?company_id={id}&doc_filter={}` | Fetch company-specific relations map. |
| `GET` | `/graph/subgraph` | `?nodes=a,b&company_id={id}` | Pull detailed adjacent node connections. |
| `GET` | `/settings/provider` | None | Verify active LLM mode and dimensions. |

---

## 👥 Dynamic Workspace Demos

1.  **Configure & Segregate Workspaces**: Open the left sidebar, click the `+` button to open the glassmorphic **Initialize Workspace Modal**. Enter a workspace name (e.g. `zomato`, `netflix`) and configure its dedicated indexing provider (**Local Ollama** or **Cloud Gemini**).
2.  **Ingest Isolated PDFs**: Go to the **Upload ToS** screen, select a PDF, and witness it index under the active workspace with its respective model pipeline.
3.  **Cross-Compare Risks**: Enter **Risk Chat**, ask questions like *"what is the dispute settlement clause?"*, and observe high-risk warnings alongside exact matching excerpts retrieved exclusively from the active workspace.
4.  **Explore the Relational Web**: Click **Inspect in Canvas** on any response to see nodes glowing in gold on the ancient legal canvas.
