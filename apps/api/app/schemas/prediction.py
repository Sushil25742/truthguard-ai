from pydantic import BaseModel, Field, field_validator
import re
from typing import List
from uuid import UUID
from datetime import datetime

class PredictionRequest(BaseModel):
    text: str = Field(..., description="The news article text to analyze.")

    @field_validator('text')
    @classmethod
    def sanitize_text(cls, v: str) -> str:
        # Remove unsafe control characters (keep tabs, newlines, carriage returns)
        # \x00-\x08, \x0B-\x0C, \x0E-\x1F, \x7F
        sanitized = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', v)
        return sanitized.strip()

class PredictionResponse(BaseModel):
    id: UUID
    prediction: str
    confidence_score: float
    risk_level: str
    explanation: str
    suspicious_phrases: List[str]
    model_version: str
    created_at: datetime

    class Config:
        from_attributes = True
