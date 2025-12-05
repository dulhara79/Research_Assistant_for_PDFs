from fastapi import APIRouter, Depends, HTTPException, status

from server.schemas.QuestionSchema import QuestionSchema

router = APIRouter(tags=["Questions"])

@router.post("/questions", status_code=status.HTTP_201_CREATED, response_model=QuestionSchema)
async def create_question(question: QuestionSchema):
    return question # Placeholder for actual creation logic