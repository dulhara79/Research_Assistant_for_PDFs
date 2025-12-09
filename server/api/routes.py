from datetime import datetime
import re
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, status
from fastapi.params import Depends

from server.schemas.QuestionSchema import QuestionSchema
from server.schemas.AnswerSchema import AnswerSchema
from server.schemas.SummarySchema import SummarySchema
from server.utils.PDFProcess import save_pdf_file
from server.utils.auth import get_current_user
from server.utils.db import db_instance
from server.utils.llm import get_answer_from_pdf
from server.worker import process_pdf_task
from server.utils.chatHistory import save_chat_message, get_chat_history, clear_chat_history
from server.utils.promptSanitizer import sanitizePrompt

router = APIRouter()


@router.post("/upload", response_model=dict, status_code=202)
async def upload_pdf(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        print("[DEBUG] inside try block")
        # 1. Save File
        pdf_id, file_path = await save_pdf_file(file)
        print(f"[DEBUG] file_path: {file_path} & pdf_id: {pdf_id}")

        # Create a pending DB record and enqueue a background task to process the PDF.
        pdf_document = {
            "pdf_id": pdf_id,
            "user_id": current_user["_id"],
            "filename": file.filename,
            "title": None,
            "summary": None,
            "status": "pending",
            "created_at": datetime.utcnow()
        }

        await db_instance.db["pdfs"].insert_one(pdf_document)
        print("[DEBUG] PDF document inserted into DB with status pending")

        # Enqueue processing task (Celery)
        try:
            process_pdf_task.delay(file_path, pdf_id, str(current_user["_id"]))
            print("[DEBUG] Enqueued process_pdf_task")
        except Exception as e:
            print(f"[ERROR] Could not enqueue Celery task: {e}")
            # mark as failed
            await db_instance.db["pdfs"].update_one({"pdf_id": pdf_id}, {"$set": {"status": "failed", "error": str(e)}})
            raise HTTPException(status_code=500, detail="Failed to enqueue processing task")

        # Return accepted with pdf id — client should poll status or check /documents
        return {"pdf_id": pdf_id, "status": "processing"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=AnswerSchema)
async def chat_with_pdf(request: QuestionSchema, current_user: dict = Depends(get_current_user)):
    try:
        print("[DEBUG] Received question:", request.question)
        # Sanitize input (basic)
        question = request.question.strip()
        if not question:
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        if not request.pdf_id:
            return {"error": "pdf_id is missing"}

        clean_question = sanitizePrompt(question)

        pdf_record = await db_instance.db["pdfs"].find_one({
            "pdf_id": request.pdf_id,
            "user_id": current_user["_id"]
        })

        if not pdf_record:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this PDF document."
            )

        # Get History
        history = await get_chat_history(request.pdf_id)
        print("[DEBUG] Chat history retrieved:", history)

        # Get RAG Answer
        result = get_answer_from_pdf(question=clean_question, pdf_id=request.pdf_id, chat_history=history,
                                     study_mode=request.study_mode)
        print("[DEBUG] Answer retrieved:", result)
        answer_text = result['result']
        source_documents = result['source_documents']
        print("[DEBUG] Final answer text:", answer_text)

        # Save to DB (User query)
        await save_chat_message(request.pdf_id, "user", clean_question)
        print("[DEBUG] Chat message saved")

        # Save to DB (AI Response)
        await save_chat_message(request.pdf_id, "assistant", answer_text, sources=source_documents)
        print("[DEBUG] AI response saved")

        return AnswerSchema(
            answer=answer_text,
            source_documents=source_documents
        )

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents")
async def get_user_documents(current_user: dict = Depends(get_current_user)):
    try:
        cursor = db_instance.db["pdfs"].find({
            "user_id": current_user["_id"]
        }).sort("created_at", -1)

        documents = []
        async for doc in cursor:
            documents.append({
                "pdf_id": doc["pdf_id"],
                "title": doc["title"],
                "file_name": doc["filename"],
                "summary": doc["summary"],
                "created_at": doc["created_at"]
            })

        return documents
    except Exception as e:
        print(f"[ERROR] Fetching docs:{e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{pdf_id}")
async def get_history_by_id(pdf_id: str, current_user: dict = Depends(get_current_user)):
    pdf_record = await db_instance.db["pdfs"].find_one({
        "pdf_id": pdf_id,
        "user_id": current_user["_id"]
    })

    if not pdf_record:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this PDF document."
        )

    history = await get_chat_history(pdf_id)

    formatted_history = []
    for msg in history:
        if msg['role'] != 'system':
            formatted_history.append({
                "role": "bot" if msg['role'] == "assistant" else "user",
                "content": msg["message"],
                "sources": msg["sources"]
            })

    return {
        "pdf_id": pdf_id,
        "title": pdf_record.get("title"),
        "history": formatted_history
    }


@router.delete("/document/{pdf_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(pdf_id: str, current_user: dict = Depends(get_current_user)):
    try:
        pdf_record = await db_instance.db["pdfs"].find_one({
            "pdf_id": pdf_id,
            "user_id": current_user["_id"]
        })

        if not pdf_record:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this PDF document."
            )

        await clear_chat_history(pdf_id)

        await db_instance.db["pdfs"].delete_one({"pdf_id": pdf_id, "user_id": current_user["_id"]})

        return None
    except Exception as e:
        print(f"[ERROR] Deleting document:{e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {e}")
