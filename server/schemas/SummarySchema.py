from pydantic import BaseModel
from typing import Optional, List

class SummarySchema(BaseModel):
    pdf_id: Optional[str] = "0000"
    summary: str
    file_name: Optional[str] = "Unknown"