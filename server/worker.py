import os
from celery import Celery
from pymongo import MongoClient

from server.utils.PDFProcess import process_pdf_to_vector_db
from server.utils.llm import generate_structured_summary
from server.utils.config import MONGO_URI, MONGO_DB_NAME


CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
celery = Celery("worker", broker=CELERY_BROKER_URL)


@celery.task(name="process_pdf_task")
def process_pdf_task(file_path: str, pdf_id: str, user_id: str):
    """
    Celery task to process a PDF: build vector store and generate structured summary.
    Updates the MongoDB `pdfs` record with summary and status.
    """
    client = None
    try:
        # 1) Build vector embeddings/store
        process_pdf_to_vector_db(file_path, pdf_id)

        # 2) Generate structured summary via LLM
        summary = generate_structured_summary(file_path)

        # 3) Update DB with summary and mark done
        client = MongoClient(MONGO_URI)
        db = client[MONGO_DB_NAME]
        db["pdfs"].update_one({"pdf_id": pdf_id}, {"$set": {"summary": summary, "status": "done"}})

        return {"pdf_id": pdf_id, "status": "done"}

    except Exception as e:
        # Ensure we mark the job as failed with error info
        try:
            if client is None:
                client = MongoClient(MONGO_URI)
            db = client[MONGO_DB_NAME]
            db["pdfs"].update_one({"pdf_id": pdf_id}, {"$set": {"status": "failed", "error": str(e)}})
        except Exception:
            pass
        raise
    finally:
        if client:
            client.close()
