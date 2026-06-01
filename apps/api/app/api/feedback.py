from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from uuid import UUID
from app.api import deps
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.models.prediction import Prediction
from app.models.feedback import Feedback

router = APIRouter()

@router.post("/{id}/feedback", response_model=FeedbackResponse)
def submit_feedback(
    request: Request,
    id: UUID,
    feedback_in: FeedbackCreate,
    db: Session = Depends(deps.get_db)
):
    prediction = db.query(Prediction).filter(Prediction.id == id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
        
    existing_feedback = db.query(Feedback).filter(Feedback.prediction_id == id).first()
    if existing_feedback:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this prediction")

    client_ip = request.client.host if request.client else "unknown"

    new_feedback = Feedback(
        prediction_id=id,
        ip_address=client_ip,
        is_correct=feedback_in.is_correct,
        comment=feedback_in.comment
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return new_feedback
