from pydantic import BaseModel, Field
from typing import Optional, List

class QASchema(BaseModel):
    is_relevant: bool = Field(description="True if the answer addresses the user's question, False otherwise.")
    is_faithful: bool = Field(
        description="True if the answer is derived ONLY from the provided context, False if it contains outside info or hallucinations.")
    reasoning: str = Field(description="A brief explanation of why this score was given.")
