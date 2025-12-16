Developer Guide — Run & Configure
=================================

Quickstart (local)
-------------------
1. Create and activate a Python virtual environment and install server dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r server/requirements.txt
```

2. Configure environment variables
- Create `server/.env` (or use environment variables). Keys referenced by `server/utils/config.py` include:
  - `GEMINAI_API_KEY` — API key for Google Generative AI / Gemini usage
  - `GEMINAI_MODEL` — model name used for generation/evaluation
  - `MONGO_URI` — MongoDB connection string
  - `MONGO_DB_NAME` — database name
  - `JWT_SECRET_KEY` — secret used to sign JWT tokens
  - `ENCRYPTION_KEY` — 32-byte key used by `Fernet` to encrypt OTP codes
  - Mail settings: `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`, `MAIL_SERVER` (fastapi-mail used for OTP emails)

3. Run the server

```powershell
# from repository root
uvicorn server.api.main:app --host 0.0.0.0 --port 8000 --reload
```

4. Start the frontend

```powershell
cd client
npm install
npm run dev
```

Key files and responsibilities
- `server/api/main.py`: FastAPI app entrypoint and router mounting.
- `server/api/routes.py`: PDF upload, chat, documents, history, delete endpoints.
- `server/api/userRoutes.py`: Auth endpoints for register/login/OTP and token issuance.
- `server/utils/PDFProcess.py`: saving PDFs, chunking, and building/persisting Chroma collections.
- `server/utils/llm.py`: LLM prompts, structured summary generation, the RAG retrieval + generation loop, and integration with the evaluator.
- `server/utils/QAScript.py`: evaluation prompt that verifies answer relevance and faithfulness against the retrieved context.

Testing tips
- Upload a small PDF to exercise the end-to-end pipeline. The upload endpoint returns a `pdf_id` and a generated summary.
- Use the client Chat UI to send a question for that `pdf_id`.

Production notes
- Vector persistence: `data/vector_db/` holds Chroma files; ensure backups or migrate to a managed vector DB for scaling.
- Background processing: consider moving `process_pdf_to_vector_db` to a background job to avoid blocking the upload endpoint for large PDFs.
