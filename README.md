# Research Assistant for PDFs

Research Assistant for PDFs is a full-stack project that provides a React + Vite web UI (`client/`) and a FastAPI backend (`server/`) to upload, process, embed, and query PDF documents using LLM-based retrieval. The backend uses LangChain-related packages and a Chroma/SQLite vector store (with optional MongoDB for metadata/history).

This README contains a concise overview, development & run instructions (Windows PowerShell), configuration hints, and a high-level project structure to get you started quickly.

**Highlights**
- Upload PDFs and persist files to `data/uploads`
- Create and persist embeddings in `data/vector_db` (Chroma/SQLite)
- Query PDFs using embedding retrieval and an LLM for answers
- Frontend built with React (Vite) for a developer-friendly UI

## Quick Start (development)

Prerequisites
- Python 3.10+ and `pip`
- Node.js 18+ and `npm`
- (Optional) MongoDB if you want persistent user/metadata storage
- (Optional) A generative model API key (e.g., Gemini/Google GenAI) — see `server/.env`

1) Install backend dependencies and run the API (PowerShell)

```powershell
# from repository root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r server/requirements.txt

# start server (development)
uvicorn server.api.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000/`.

2) Install and run the frontend (Vite)

```powershell
cd client
npm install
npm run dev
```

Open the Vite dev URL (usually `http://localhost:5173`) to use the web UI. The client is configured to contact the backend at `http://localhost:8000` (adjust if you change ports).

## Configuration (`server/.env`)
Create a `server/.env` file (examples):

```
# server/.env
GEMINAI_API_KEY=your_geminai_api_key_here
GEMINAI_MODEL=gemini-1.5-probably
EMBEDDING_MODEL=all-MiniLM-L6-v2
MONGO_URI=mongodb://username:password@host:port
MONGO_DB_NAME=research_assistant
UPLOAD_DIR=data/uploads
VECTOR_DB_DIR=data/vector_db
```

- `GEMINAI_API_KEY` and `GEMINAI_MODEL` are used by `server/utils/llm.py` and `server/utils/config.py`.
- If you don't use MongoDB, you may leave `MONGO_URI` and `MONGO_DB_NAME` empty; the server will attempt to connect on startup but the app supports running without Mongo for basic functionality.

## Project structure (high level)

- `server/` — FastAPI backend
  - `server/api/main.py` — FastAPI app entrypoint (used by `uvicorn`)
  - `server/api/routes.py`, `userRoutes.py` — API route modules
  - `server/utils/` — helpers: `config.py`, `db.py`, `PDFProcess.py`, `llm.py`, `QAScript.py`, etc.
  - `server/requirements.txt` — Python dependencies
- `client/` — React + Vite frontend
  - `client/src/` — React sources and components
  - `client/package.json` — scripts & dependencies
- `data/` — runtime data
  - `data/uploads/` — uploaded PDF files (persist here)
  - `data/vector_db/` — Chroma/SQLite vector DB data (persist to reuse embeddings)

## How the system works (brief)

- Uploads land in `data/uploads`. When a PDF is processed, the pipeline extracts text, creates embeddings, and stores them in the Chroma-backed vector store under `data/vector_db`.
- When the client issues a query, the backend retrieves context using the vector store and calls the configured LLM (see `server/utils/llm.py`) to generate a concise, faithful answer.

## Common commands

- Run backend (dev): `uvicorn server.api.main:app --reload --host 0.0.0.0 --port 8000`
- Run frontend (dev): `cd client; npm run dev`
- Build frontend for production: `cd client; npm run build`
- Preview frontend build: `cd client; npm run preview`

## Troubleshooting

- Missing model API key or invalid model name: check `server/.env` and `server/utils/config.py`.
- MongoDB connection errors: verify `MONGO_URI` and network access. The server logs connection errors but will still attempt to run if Mongo is not critical to the invoked endpoints.
- Vector DB issues: ensure `data/vector_db` is writable by the process and not locked.

## Tests & linting

- Frontend lint: `cd client; npm run lint` (requires dev dependencies installed).
- Consider adding Python tests (pytest) for server endpoints and unit logic; none are included by default.


## License

See the `LICENSE` file at the repository root for licensing information.

