from pydantic import BaseModel
from typing import Optional, List

class AnswerSchema(BaseModel):
    answer: str
    source_documents: List[str]