Backend — RAG System (Detailed)
================================

This document explains how the backend constructs a Retrieval-Augmented Generation (RAG) pipeline from uploaded PDFs and how the system ensures answer relevance and faithfulness.

1) Ingest & Vectorization
- Endpoint: `POST /api/upload` implemented in `server/api/routes.py`.
- Workflow:
  - The uploaded file is saved by `server/utils/PDFProcess.save_pdf_file` into `data/uploads/` with a `pdf_id` prefix.
  - `server/utils/PDFProcess.process_pdf_to_vector_db` loads the PDF via `PyMuPDFLoader`, splits text into chunks using `RecursiveCharacterTextSplitter` (chunk_size=1000, overlap=200), computes embeddings, and persists them to a Chroma collection named `collection_{pdf_id}` in `data/vector_db/`.
  - Embeddings are created by `get_embeddings()` in `PDFProcess.py` which currently returns `HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")`. (There is commented code for Google embeddings if configured.)

2) Retrieval
- Handler: `server/utils/llm.get_answer_from_pdf`.
- For question answering, the code obtains a vector store via `get_vector_store(pdf_id)` and builds a retriever:
  - `retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k":5, "fetch_k":20, "lambda_mult":0.5})`
  - Retrieval returns relevant document chunks which are merged into the assistant prompt.

3) Generation and Study Mode
- The system uses `ChatGoogleGenerativeAI` (configured in `server/utils/llm.py`) to generate answers.
- Two prompting modes exist:
  - Standard RAG prompt: Answer using only the provided PDF context and say "I cannot find the answer in the document" if the context lacks the answer.
  - Study (Teacher) mode: Treat the assistant as a teacher, combine PDF content with external context from `get_external_context` (Wikipedia, DuckDuckGo) to produce an explanatory answer.

  - Implementation note: `get_external_context` in `server/utils/llm.py` uses `WikipediaQueryRun` (with `WikipediaAPIWrapper`) and `DuckDuckGoSearchRun` to fetch concise external material; these results are appended to the prompt only in `study_mode` so the LLM can provide broader explanations and background when teaching-style answers are requested.

4) Evaluation Loop (Faithfulness & Relevance)
- After generating an answer, the backend calls `evaluate_response` in `server/utils/QAScript.py`.
  - `QAScript` uses a low-temperature `ChatGoogleGenerativeAI` evaluator and a `JsonOutputParser` with the `QASchema` to ask the LLM whether the answer is relevant and faithful.
  - `get_answer_from_pdf` will retry up to 3 times: it checks evaluator output (`is_relevant`, `is_faithful`) and either accepts the answer or uses the evaluator's reasoning as feedback to prompt again.

5) Why Chroma + Local Embeddings
- Chroma is used for efficient local persistence of vector data and supports collections per PDF (this keeps each PDF's vectors isolated).
- `VECTOR_DB_DIR` is `data/vector_db` (see `server/utils/config.py`).

6) Files & Functions to Review
- `server/utils/PDFProcess.py`: file save, chunking, embedding creation, Chroma persistence.
- `server/utils/llm.py`: building prompts, retriever usage, answer generation, study mode and evaluation loop.
- `server/utils/QAScript.py`: evaluator prompt and JSON parsing into `QASchema`.

7) Caveats & Notes
- Long PDFs: chunking and embedding may be compute- and memory-intensive; consider async background processing or task queue (Celery/RQ) for production.
- Embedding model: currently `HuggingFaceEmbeddings` (BAAI/bge-small) is used; this can be swapped for a managed embedding service if required.
- Security: ensure `ENCRYPTION_KEY`, `JWT_SECRET_KEY`, and mail credentials are set and kept safe.
