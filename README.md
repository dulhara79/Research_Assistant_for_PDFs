---
title: Research Assistant Backend
emoji: 🤖
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
---

# Research Assistant for PDFs

Research Assistant for PDFs is a full-stack prototype that helps you upload, process, embed, and query PDF documents using retrieval-augmented generation (RAG). It contains:

- A FastAPI backend (`server/`) that handles PDF uploads, embedding generation (Chroma/SQLite), and LLM-based question answering.
- A React + Vite frontend (`client/`) that provides a developer-friendly UI to upload documents and chat with them.

This README explains how to set up and run the project locally on Windows (PowerShell), what environment variables are required, and the main API endpoints.

**Highlights**
- Upload PDFs and persist files to `data/uploads`
- Store embeddings in `data/vector_db` (Chroma-backed SQLite store)
- Query documents with a conversational interface (chat + source traces)
- Optional MongoDB to persist users, document metadata and chat history
 - Study Mode: set `study_mode` (client) to `true` and the backend will augment PDF context with external information fetched from Wikipedia and DuckDuckGo (see `server/utils/llm.get_external_context`) to produce teaching-style, explanatory answers.

**Repository layout (short)**
- `server/` — FastAPI backend (API routes, utils, schema)
- `client/` — React + Vite frontend
- `data/` — runtime data: `uploads/` and `vector_db/`

Prerequisites
- Python 3.10+
- Node.js 18+ and `npm`
- (Optional) MongoDB if you want persistent user/metadata storage

Quick start — backend (PowerShell)

1) Create and activate a virtual environment, install dependencies, and run the API:

```powershell
# from repository root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r server/requirements.txt

# start server (development)
uvicorn server.api.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://localhost:8000/`.

Quick start — frontend (PowerShell)

```powershell
cd client
npm install
// start dev server bound to localhost on a port you choose
// example (used with Nginx during development):
// npm run dev -- --host 127.0.0.1 --port 5173
npm run dev -- --host 127.0.0.1 --port 5173
```

Open the Vite dev URL (usually `http://localhost:5173`) to use the UI. The client expects the backend at `http://localhost:8000` by default.

Environment configuration (`server/.env`)

Create `server/.env` with the values you need. Minimum useful vars for local runs (examples):

```env
# LLM / embeddings
GEMINAI_API_KEY=your_geminai_api_key_here
GEMINAI_MODEL=gemini-1.5
EMBEDDING_MODEL=models/embedding-001

# Optional MongoDB (for users, metadata, history)
MONGO_URI=mongodb://username:password@host:port
MONGO_DB_NAME=research_assistant

# JWT + encryption (used for auth/session tokens)
JWT_SECRET_KEY=supersecretkey
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60
ENCRYPTION_KEY=some-base64-or-hex-key

# Mail (OTP flow)
MAIL_SERVER=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=you@example.com
MAIL_PASSWORD=your_mail_password
MAIL_FROM=you@example.com

# Data directories (defaults are fine)
UPLOAD_DIR=data/uploads
VECTOR_DB_DIR=data/vector_db
```

Notes:
- If you don't provide `MONGO_URI`, the app will still start but parts of the system (user persistence, document indexes stored in Mongo) will be limited. The server logs startup connection attempts.
- Mail configuration is used by the OTP / registration flow (the app sends OTPs for registration/login verification).

Main API endpoints

All API endpoints are under the `/api` prefix. The backend requires authentication for document and chat operations (see *Auth* below).

- POST `/api/upload` — Upload a PDF and process it (returns a structured summary). Requires multipart-form file and auth.
- POST `/api/chat` — Ask a question about a processed PDF (body: { pdf_id, question, study_mode }). Returns `answer` and `source_documents`.
- GET `/api/documents` — List documents for the authenticated user.
- GET `/api/history/{pdf_id}` — Get chat history for a PDF (authenticated user must own the PDF).
- DELETE `/api/document/{pdf_id}` — Delete a document and its chat history (owner only).

Auth and user flow

This project uses an email + OTP flow + JWT tokens for authentication:

1. POST `/api/auth/register` — create an account. Server generates an OTP and emails it.
2. POST `/api/auth/login` — request a login OTP emailed to the user's address.
3. POST `/api/auth/verify-otp` — verify the OTP; server returns a JWT access token on success.

Use the returned `access_token` as a Bearer token in the `Authorization` header for protected endpoints:

```
Authorization: Bearer <access_token>
```

Data storage and directories

- `data/uploads/` — uploaded PDF files (saved by `server/utils/PDFProcess.py`).
- `data/vector_db/` — Chroma/SQLite vector store files created by the embedding pipeline.

Development notes

- The main FastAPI entrypoint is `server/api/main.py` (used by `uvicorn`). It mounts `data/` as static files so you can access processed assets if needed.
- The upload endpoint processes PDFs into embeddings by calling `server/utils/PDFProcess.py` and Chroma via `langchain-chroma`.
- Frontend scripts are in `client/package.json`:
  - `npm run dev` — start Vite dev server
  - `npm run build` — build production files
  - `npm run preview` — preview the production build

Nginx / local load-balancing (developer notes)

- You can run multiple frontend dev servers on different ports (for example `5173`, `5174`, `5175`) and proxy them with `nginx` for testing load-balancing or routing scenarios.
- Frontend example commands (pick a port):

```powershell
# from `client/` folder
npm run dev -- --host 127.0.0.1 --port 5173
npm run dev -- --host 127.0.0.1 --port 5174
npm run dev -- --host 127.0.0.1 --port 5175
```

- Backend example commands (you can run multiple uvicorn instances on different ports):

```powershell
uvicorn server.api.main:app --reload --host 127.0.0.1 --port 8000
uvicorn server.api.main:app --reload --host 127.0.0.1 --port 8001
uvicorn server.api.main:app --reload --host 127.0.0.1 --port 8002
```

- To run Nginx on Windows (from the extracted nginx folder):

```powershell
# from the folder that contains `nginx.exe`
.\nginx.exe
# stop Nginx (example)
taskkill /F /IM nginx.exe
```

- If you're proxying the frontend or backend through Nginx, update the `nginx.conf` accordingly and restart `nginx.exe` after changes.

Troubleshooting & tips

- Vector DB locked / permissions: ensure `data/vector_db` exists and is writable by your user.
- Missing LLM key / invalid model: verify `GEMINAI_API_KEY` and `GEMINAI_MODEL` in `server/.env` and check logs from `uvicorn`.
- Mail not sending OTPs: verify `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, and `MAIL_PASSWORD`.
- If Mongo fails to connect and you don't need it for quick testing, you can still run upload/chat flows for a single session if the backend handles missing Mongo gracefully — but persistence will be limited.

License

See the `LICENSE` file at the repository root.

Documentation
-------------
Additional, focused documentation is available in the `docs/` directory:

- `docs/overview.md` — high-level architecture and component map.
- `docs/backend_rag.md` — detailed explanation of the backend RAG pipeline (ingest, embeddings, Chroma, retrieval, evaluation).
- `docs/features.md` — user-facing features and where they are implemented (OTP, summary, download, chat, history).
- `docs/developer_guide.md` — run instructions, environment variables, and developer tips.

Read these documents for deeper information about the OTP flow, PDF summary generation, client-side PDF download, and the RAG evaluation loop.
