from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class FeedbackCreate(BaseModel):
    is_correct: bool
    comment: str | None = None

class FeedbackResponse(BaseModel):
    id: UUID
    prediction_id: UUID
    is_correct: bool
    comment: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
