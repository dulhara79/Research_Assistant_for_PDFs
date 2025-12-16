Project Features — Reference
=============================

This file lists the user-facing features and how they are implemented in the codebase.

Authentication & OTP
- Endpoints:
  - `POST /api/auth/register` (`server/api/userRoutes.py`) — registers a user and immediately generates & emails an OTP for verification.
  - `POST /api/auth/login` (`server/api/userRoutes.py`) — verifies credentials; on success generates a login OTP and emails it.
  - `POST /api/auth/send-otp` and `POST /api/auth/verify-otp` — helper endpoints for explicit OTP workflows.
- Implementation details:
  - OTP generation: `server/utils/security.generate_otp()` returns a numeric OTP (6 digits by default).
  - OTP encryption: OTPs are encrypted using `Fernet` with the `ENCRYPTION_KEY` before storing in MongoDB; encryption/decryption functions are in `server/utils/security.py`.
  - Expiry: OTPs are stored with an expiration timestamp (5 minutes).

PDF Upload & Summary
- Endpoint: `POST /api/upload` (`server/api/routes.py`).
- Implementation:
  - `save_pdf_file` saves the uploaded PDF to `data/uploads` and returns a `pdf_id`.
  - `process_pdf_to_vector_db` builds chunks and persists embeddings to Chroma.
  - `generate_structured_summary` (in `server/utils/llm.py`) produces a structured summary of the paper (title, problem, methodology, results, conclusion) using a dedicated LLM prompt.
  - The upload endpoint stores PDF metadata and the generated summary in MongoDB under `pdfs`.

Chat with PDF (RAG)
- Endpoint: `POST /api/chat` (`server/api/routes.py`).
- The client sends `{ pdf_id, question, study_mode }`.
- The backend retrieves relevant chunks (MMR retriever) and runs the generative LLM. An evaluator (`QAScript`) checks relevance and faithfulness and the backend may retry.

- Study Mode details: If the client sets `study_mode: true` the backend augments the PDF context with external information fetched by `server/utils/llm.get_external_context`. That helper queries Wikipedia (`WikipediaQueryRun` + `WikipediaAPIWrapper`) and DuckDuckGo (`DuckDuckGoSearchRun`) and appends those results to the prompt so the assistant can teach, expand on concepts, or provide background examples not present in the PDF.

History & Documents
- `GET /api/documents` returns the user's uploaded documents.
- `GET /api/history/{pdf_id}` returns chat history for a document.
- `DELETE /api/document/{pdf_id}` deletes a document and its chat history from the DB (note: files and vector store removal are handled in the code path that clears chat history, but verify persistence cleanup in your environment).

Summary Download (Client-side)
- The summary panel (client) includes a “Download” button that uses `jsPDF` to render and download the structured summary as a PDF. See `client/src/components/chat/SummaryPanel.jsx`.

Security & Best Practices
- Required secrets are read from a `.env` file via `server/utils/config.py`. Ensure the following are present and secure: `GEMINAI_API_KEY`, `MONGO_URI`, `JWT_SECRET_KEY`, `ENCRYPTION_KEY`, and mail credentials.
