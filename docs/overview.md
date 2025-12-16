Research Assistant for PDFs — Overview
====================================

This repository implements a web application that lets users upload PDF research papers, automatically builds a retrieval-augmented generation (RAG) backend over those PDFs, and provides a chat-style research assistant to query and summarize the documents.

High-level components
- Frontend (`client/`): React + Vite UI that handles authentication, PDF upload, chat interface, and client-side summary download (via `jsPDF`).
- Backend (`server/`): FastAPI application that exposes REST endpoints for auth (OTP-based), PDF upload/processing, RAG chat, document listing/history and deletion. The backend uses a MongoDB for user and PDF metadata and stores vector data with Chroma.
- Data storage (`data/`): Uploaded PDFs are saved to `data/uploads/`. Vector store files are persisted under `data/vector_db/`.

Primary flows
- User authentication: registration and login both use a short-lived numeric OTP sent by email. OTPs are encrypted before storing in the database and expire after 5 minutes.
- PDF ingest: the file is saved, loaded with `PyMuPDF`, split into chunks, embedded with a sentence embedding model, and persisted into a Chroma collection named for the PDF ID.
- RAG chat: the assistant retrieves relevant document chunks via a Chroma retriever (MMR), combines them with optional external context (Wikipedia/DuckDuckGo in study mode), and asks an LLM to generate an answer. Answers are evaluated by a separate evaluation prompt to check relevance and faithfulness.

- Study Mode: when the client enables `study_mode` the backend collects additional external context (via `server/utils/llm.get_external_context`) from Wikipedia and DuckDuckGo to provide broader explanations and teaching-style answers.
- Summary generation: a dedicated LLM prompt extracts a structured summary (title/authors/abstract/problem/method/results/conclusion) during upload and that summary is returned to the client.

Where to look in the code
- Authentication / OTP: `server/api/userRoutes.py` and `server/utils/security.py`.
- PDF ingest & vector store: `server/utils/PDFProcess.py`.
- RAG pipeline and LLM usage: `server/utils/llm.py` and `server/utils/QAScript.py`.
- REST endpoints: `server/api/routes.py` and `server/api/userRoutes.py`.
- Frontend chat and download UI: `client/src/pages/ChatPage.jsx` and `client/src/components/chat/SummaryPanel.jsx`.

This overview is a starting point — read the Backend RAG and Features docs for deeper details.
