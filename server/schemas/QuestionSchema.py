from pydantic import BaseModel
from typing import Optional

class QuestionSchema(BaseModel):
    question: str
    pdf_id: str
    study_mode: bool = False