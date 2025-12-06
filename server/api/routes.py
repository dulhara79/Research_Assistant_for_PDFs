import re
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from server.schemas.QuestionSchema import QuestionSchema
from server.schemas.AnswerSchema import AnswerSchema
from server.schemas.SummarySchema import SummarySchema
from server.utils.PDFProcess import save_pdf_file, process_pdf_to_vector_db
from server.utils.llm import generate_structured_summary, get_answer_from_pdf
from server.utils.chatHistory import save_chat_message, get_chat_history

router = APIRouter()


@router.post("/upload", response_model=SummarySchema)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        print("inside try block")
        # 1. Save File
        pdf_id, file_path = await save_pdf_file(file)
        print(f"file_path: {file_path} & pdf_id: {pdf_id}")
        # 2. Process Vectors (Compute intensive - strictly, should be background task,
        # but for this assignment we await to ensure RAG is ready immediately)
        process_pdf_to_vector_db(file_path, pdf_id)

        print("after process_pdf_to_vector_db")
        # 3. Generate Summary
        summary_text = generate_structured_summary(file_path)
        print("filepath passed")

        match = re.search(r"\*\*Title:\*\*\s*(.*)", summary_text)
        if match:
            title = match.group(1).strip()
        else:
            title = "Unknown Title"

        QuestionSchema(pdf_id=pdf_id, question="")

        return SummarySchema(
            pdf_id=pdf_id,
            title = title,
            file_name=file.filename,
            summary=summary_text
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=AnswerSchema)
async def chat_with_pdf(request: QuestionSchema):
    try:
        print("Received question:", request.question)
        # Sanitize input (basic)
        clean_question = request.question.strip()
        if not clean_question:
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        if not request.pdf_id:
            return {"error": "pdf_id is missing"}

        # Get History
        history = await get_chat_history(request.pdf_id)
        print("Chat history retrieved:", history)

        # Get RAG Answer
        result = get_answer_from_pdf(clean_question, request.pdf_id, history)
        print("Answer retrieved:", result)
        answer_text = result['result']
        source_documents = result['source_documents']
        print("Final answer text:", answer_text)

        # Save to DB (User query)
        await save_chat_message(request.pdf_id, "user", clean_question)
        print("Chat message saved")

        # Save to DB (AI Response)
        await save_chat_message(request.pdf_id, "assistant", answer_text)
        print("AI response saved")

        return AnswerSchema(
            answer=answer_text,
            source_documents=source_documents
        )

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
