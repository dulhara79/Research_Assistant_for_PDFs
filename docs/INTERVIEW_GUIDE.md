**Interview Guide: Research Assistant for PDFs**

This guide prepares you to explain, demo, and confidently interview about the Research Assistant for PDFs repository.

**Quick Summary**:
- **What it is:** Full-stack prototype (React + FastAPI) that uploads PDFs, creates embeddings, stores vectors in a Chroma/SQLite backend, and answers user questions with a RAG (retrieval-augmented generation) pipeline.
- **Main goals for interview:** explain architecture, key design tradeoffs (embedding/model choices, persistence), security/auth flow, and how to extend/scale the system.

**Tech Stack**:
- **Backend:** Python 3.10+, FastAPI, Uvicorn, Motor (async Mongo), Chroma (vector store via `langchain-chroma`), LangChain integrations, PyMuPDF for PDF parsing.
- **Frontend:** React (Vite), Tailwind (via dependencies in `client/`).
- **Persistence:** `data/uploads` for files, `data/vector_db` for Chroma/SQLite persistence, optional MongoDB for users/chat history.
- **LLM & embeddings:** Gemini (via `langchain-google-genai`) for chat & evaluation, HuggingFace embeddings (`BAAI/bge-small-en-v1.5`) used in `PDFProcess.py`.

**Where to look in repo**:
- Backend entry: `server/api/main.py`
- API routes: `server/api/routes.py`, `server/api/userRoutes.py`
- PDF ingest & vectors: `server/utils/PDFProcess.py`
- LLM usage & prompts: `server/utils/llm.py`, `server/utils/QAScript.py`
- Auth & security: `server/utils/auth.py`, `server/utils/security.py`
- DB connector: `server/utils/db.py`
- Chat history: `server/utils/chatHistory.py`
- Environment/config: `server/utils/config.py`
- Frontend: `client/` (entry `client/main.jsx`, scripts in `client/package.json`)

**Run locally (Windows PowerShell)**
1. Backend
```powershell
# from repository root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r server/requirements.txt
# start server
uvicorn server.api.main:app --reload --host 127.0.0.1 --port 8000
```

2. Frontend
```powershell
cd client
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

3. Minimum env vars (create `server/.env`):
```
GEMINAI_API_KEY=...
GEMINAI_MODEL=gemini-1.5
ENCRYPTION_KEY=<Fernet 32-byte base64 key>
JWT_SECRET_KEY=...
MONGO_URI=... (optional)
MONGO_DB_NAME=research_assistant (optional)
```

**Important files / responsibilities (talking points)**
- `server/api/routes.py`: upload -> calls `save_pdf_file`, `process_pdf_to_vector_db`, and `generate_structured_summary`. Shows synchronous heavy work happening in-request (candidate improvement: background processing).
- `server/utils/PDFProcess.py`: loads PDF pages via PyMuPDF, splits text, builds Chroma collection named `collection_{pdf_id}`; uses `HuggingFaceEmbeddings`.
- `server/utils/llm.py`: constructs prompts for summary, RAG response, and evaluation; uses `ChatGoogleGenerativeAI` (Gemini). Also supports `study_mode` (external web context via Wikipedia/DuckDuckGo).
- `server/utils/QAScript.py`: uses LLM to evaluate relevance and faithfulness of generated answers (strict evaluator + JSON parser).
- `server/utils/security.py`: password hashing (bcrypt via passlib), JWT token creation, OTP encryption (Fernet). Explain importance of secure key storage and rotation.
- `server/utils/chatHistory.py`: encrypts messages before storing with Fernet. Good talking point: trade-offs (privacy vs. ability to search), and re-encrypting on key change.

**Main API endpoints (for demo and discussion)**
- `POST /api/auth/register` — Register (sends OTP email). Body: `email`, `password`, `name`.
- `POST /api/auth/login` — Checks password then sends OTP via email.
- `POST /api/auth/verify-otp` — Verify OTP and returns JWT token.
- `POST /api/upload` — Upload PDF (multipart form, requires Bearer token). Returns summary and `pdf_id`.
- `POST /api/chat` — Ask question: body `{"pdf_id":"...","question":"...","study_mode":false}`. Returns `answer` and `source_documents`.
- `GET /api/documents` — List user documents (protected).
- `GET /api/history/{pdf_id}` — Get chat history for document (protected).

**Key design & talking points to prepare**
- Why Chroma + persistence directory? (fast local vector store, easy to demo). Discuss tradeoffs vs. managed vector stores.
- Embedding choice: HuggingFace `BAAI/bge-small-en-v1.5` — mention CPU/GPU implications and latency.
- LLM prompting: show `generate_structured_summary` and RAG prompt differences (teacher vs. standard). Talk about prompt engineering, temperature, and when to use external context (`study_mode`).
- Security: JWT tokens, OTP flow, Fernet for chat encryption. Discuss where secret keys should be stored (Azure Key Vault, AWS Secrets Manager), and how to re-encrypt chat history if key rotated.
- Async & concurrency: Motor + FastAPI allow async DB ops; heavy CPU tasks like embedding should be offloaded (BackgroundTasks, Celery, or external worker). Currently `process_pdf_to_vector_db` is called synchronously — risk of blocking request.
- Testing & debugging: unit test `promptSanitizer.sanitizePrompt`, small integration test for `PDFProcess.get_vector_store` using a sample small PDF.

**Common interview questions (repo-specific) and short answers**
- Q: How does upload -> answer flow work end-to-end?
  - A: File saved in `data/uploads`, PyMuPDF loads pages, text split into chunks, embeddings computed and persisted to Chroma `collection_{pdf_id}`, document metadata saved to Mongo, `POST /api/chat` uses Chroma retriever -> constructs prompt + LLM -> returns answer and sources.
- Q: Where are the obvious single points of failure? How to fix?
  - A: Synchronous vectorization blocks requests; fix with background worker. Single-host Chroma persistence could be lost; use an external vector DB or shared storage. Secrets in `.env` should be in a vault.
- Q: How would you scale embeddings/ingest for many PDFs?
  - A: Use a queue (Redis/RabbitMQ) + worker pool (Celery / RQ) with worker autoscaling; store vectors in scalable stores (Milvus/Weaviate/managed Chroma cloud). Also shard collections and optimize chunking.
- Q: How to improve answer faithfulness and reduce hallucination?
  - A: Improve retrieval (higher fetch_k, better reranker), stricter prompts, evaluation loop (like `QAScript.evaluate_response`), and truth-checking using the extracted source passages.
- Q: How to handle long PDFs that exceed token limits?
  - A: Use chunking (already present), rank+retrieve, and summarization pipeline to compress context. Consider hierarchical retrieval.

**Practice exercises (small, interview-style tasks)**
1. Move `process_pdf_to_vector_db` to a background task: implement a BackgroundTasks-based queue and add a `status` field to `pdfs` collection. Acceptance: `POST /api/upload` returns quickly with `status: processing` and `GET /api/documents` shows `processing|ready`.
2. Add pagination to `GET /api/documents` (limit+offset or cursor). Acceptance: `?limit=10&page=2` works.
3. Unit test `sanitizePrompt` edge-cases (HTML encoded text, extremely long input). Add tests using `pytest`.
4. Add rate-limiting to `/api/chat` (per-user) to avoid abuse; use an in-memory store like Redis or a simple token-bucket per-user in Mongo for demo.
5. Add a `/api/health` endpoint that checks Mongo connectivity and vector directory accessibility.

**Mock interview / sample answers (concise)**
- Q: Why encrypt chat messages in DB?
  - A: Protects user privacy. Even if DB compromised, message content is not in plaintext. Tradeoff: search on content is harder.
- Q: Why store first page preview as 'source_documents' header?
  - A: Quick human-readable trace and title preview; useful for showing provenance when full content is large.
- Q: If asked to improve latency for chats, what would you do?
  - A: Cache top-k retrieval results, warm embeddings for frequently queried docs, run LLM calls in parallel when evaluating alternatives, use smaller LLMs or distillation for low-cost passes.

**Cheat sheet: quick commands & cURL examples**
- Start backend (PowerShell): `uvicorn server.api.main:app --reload --host 127.0.0.1 --port 8000`
- Start frontend: `cd client; npm run dev -- --host 127.0.0.1 --port 5173`
- Upload PDF (curl):
```bash
curl -X POST "http://localhost:8000/api/upload" -H "Authorization: Bearer <token>" -F "file=@/path/to/doc.pdf"
```
- Chat (curl):
```bash
curl -X POST "http://localhost:8000/api/chat" -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"pdf_id":"<id>","question":"What is the main contribution?","study_mode":false}'
```

**How I’d present this in an interview (2–3 minute pitch)**
- Explain the user problem: quickly extract and query knowledge from PDFs.
- Show architecture: React frontend -> FastAPI backend -> PDF ingest -> Embeddings -> Vector DB -> Retriever -> LLM.
- Highlight two engineering tradeoffs: (1) local Chroma for low-friction demo vs managed service for scale, and (2) encrypt chat history for privacy vs searchability.
- Finish with 2 small improvement ideas: offload embedding to workers + improve retrieval ranking.

---

If you want, I can do one of the following next:
- run & verify the app locally (I can provide exact PowerShell commands),
- implement one practice exercise (e.g., background processing for ingestion), or
- run a mock technical interview where I ask you the repo-specific questions above.

File created: `INTERVIEW_GUIDE.md`
