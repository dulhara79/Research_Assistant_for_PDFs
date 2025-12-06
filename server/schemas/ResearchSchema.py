from pydantic import BaseModel
from typing import Optional, List

class ResearchSchema(BaseModel):
    topic: Optional[str] = None
    pdf_id: Optional[str] = "0000"
    question: Optional[str] = None
    answer: Optional[str] = None
    summary: Optional[str] = None
    file_name: Optional[str] = "Unknown"
    source_documents: List[str] = []