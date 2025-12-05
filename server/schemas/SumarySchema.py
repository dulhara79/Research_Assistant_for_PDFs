from pydantic import BaseModel
from typing import Optional, List

class AnswerSchema(BaseModel):
    pdf_id: Optional[str]
    summary: str
    file_name: Optional[str]