# Research Assistant for PDFs

Research Assistant for PDFs is a small full-stack project that provides a web UI (client) and a FastAPI backend (server) to upload, process, embed, and query PDF documents. The backend uses LangChain-related packages, a Chroma/SQLite vector store, and an optional MongoDB connection for metadata/history.

**This README explains how to set up and run the project locally on Windows (PowerShell), what the repository contains, and common troubleshooting tips.**

**Features**
- Upload PDFs and store them under `data/uploads`
- Create and persist embeddings in `data/vector_db` (Chroma/SQLite)
- Query/search PDFs using language-model embeddings and retrieval
- Web UI powered by React + Vite for interacting with the assistant

**Quick Links**
- Backend (FastAPI): `server/`
- Frontend (React + Vite): `client/`
- Persisted data: `data/` (uploads + vector DB)

**Prerequisites**
- Python 3.10+ (Windows) and `pip`
- Node.js 18+ and `npm` (for the client)
- Optional: MongoDB instance (if you want persistent metadata/history)
- Optional: Gemini AI key or other model credentials used by the server (see `.env` below)

Getting started (server)

1. Open PowerShell and clone the repo (if you haven't already):

```powershell
git clone <repo-url>
cd Research_Assistant_for_PDFs
```

2. Create a Python virtual environment and activate it (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Install Python dependencies:

```powershell
pip install --upgrade pip
pip install -r server/requirements.txt
```

4. Create a `.env` file under `server/` with the values below (example):

```
# server/.env
GEMINAI_API_KEY=your_geminai_api_key_here
GEMINAI_MODEL=some-model-name
MONGO_URI=mongodb://username:password@host:port/?retryWrites=true&w=majority
MONGO_DB_NAME=research_assistant
```

Notes:
- If you don't use MongoDB you can leave `MONGO_URI` / `MONGO_DB_NAME` empty; the server attempts to connect when starting.
- `GEMINAI_API_KEY` is read by `server/utils/config.py`. Adjust `GEMINAI_MODEL` to the model you intend to use.

5. Run the backend (development):

```powershell
# from repository root
uvicorn server.api.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be reachable at `http://localhost:8000/`. The frontend is configured to use `http://localhost:8000` for API calls.

Getting started (client)

1. From repository root, change to the client directory and install:

```powershell
cd client
npm install
```

2. Run the dev server:

```powershell
npm run dev
```

Open `http://localhost:5173` (Vite default) in your browser. The client makes requests to `/api` endpoints on the backend; the backend allows CORS from `http://localhost:5173`.

Project structure (important files)
- `server/` - FastAPI backend
  - `server/api/main.py` - FastAPI app entrypoint and UVicorn runner
  - `server/api/routes.py` - API routes
  - `server/utils/` - helpers (config, db, PDF processing, llm wrappers)
  - `server/requirements.txt` - Python dependencies
- `client/` - React frontend (Vite)
  - `client/src/` - React app sources
  - `client/package.json` - client scripts & deps
- `data/` - persisted runtime data
  - `data/uploads/` - uploaded PDF files
  - `data/vector_db/` - Chroma/SQLite vector DB (example: `chroma.sqlite3`)

Notes about data and persistence
- The server creates the `data/` directory if it doesn't exist. Uploaded PDFs go to `data/uploads` and the vector DB is kept in `data/vector_db`.
- Keep `data/vector_db` if you want to persist embeddings between restarts.

Environment & configuration
- Default configuration is loaded from `server/.env` (see `server/utils/config.py`).
- If you need to customize embedding or model settings, inspect `server/utils/llm.py` and `server/utils/config.py`.

Troubleshooting
- Missing .env values: the server will print the loaded values on `/` and in startup logs. Ensure `GEMINAI_API_KEY` and `MONGO_URI` are set if needed.
- MongoDB connection failures: verify network access and credentials. You can run temporarily without Mongo by leaving those values blank.
- Port conflicts: change the `--port` value when launching `uvicorn` or the Vite dev server.

Testing & development notes
- Backend: the app runs with `uvicorn` in reload mode for development. Add tests and a test runner as needed.
- Frontend: lint with `npm run lint` in `client/` (requires ESLint dev dependencies which are in `client/package.json`).

Contributing
- Fork and open a PR on the `develop` branch.
- Run the backend and client locally, add tests for new features, and document behavior in `README.md`.

License
- This repository includes a `LICENSE` file at the root.

Contact / Next steps
- If you'd like, I can:
  - Add a sample `server/.env.example` file to the repo
  - Add startup scripts (PowerShell `.ps1`) for easier local bootstrapping
  - Create a short CONTRIBUTING.md with commit and PR guidelines

---
