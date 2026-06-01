from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.api import deps
from app.models.prediction import Prediction
from app.models.feedback import Feedback
from app.schemas.prediction import PredictionResponse
from app.schemas.feedback import FeedbackResponse

router = APIRouter()

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(deps.get_db),
    admin: bool = Depends(deps.get_admin_user)
):
    from datetime import datetime, time
    
    total_predictions = db.query(Prediction).count()
    
    fake_count = db.query(Prediction).filter(Prediction.prediction == "Fake").count()
    real_count = db.query(Prediction).filter(Prediction.prediction == "Real").count()
    uncertain_count = db.query(Prediction).filter(Prediction.prediction == "Uncertain").count()
    
    # New metrics
    today_start = datetime.combine(datetime.utcnow().date(), time.min)
    predictions_today = db.query(Prediction).filter(Prediction.created_at >= today_start).count()
    
    avg_conf_result = db.query(func.avg(Prediction.confidence_score)).scalar()
    average_confidence = float(avg_conf_result) if avg_conf_result is not None else 0.0
    
    total_feedback_count = db.query(Feedback).count()
    
    recent_feedback = db.query(Feedback).order_by(Feedback.created_at.desc()).limit(5).all()
    
    return {
        "total_users": 0, # Maintained for frontend compatibility, though users no longer exist
        "total_predictions": total_predictions,
        "predictions_today": predictions_today,
        "average_confidence": average_confidence,
        "total_feedback_count": total_feedback_count,
        "prediction_distribution": {
            "fake": fake_count,
            "real": real_count,
            "uncertain": uncertain_count
        },
        "recent_feedback": [
            {
                "id": str(f.id),
                "is_correct": f.is_correct,
                "comment": f.comment,
                "created_at": f.created_at
            } for f in recent_feedback
        ]
    }

@router.get("/predictions", response_model=List[PredictionResponse])
def get_all_predictions(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(deps.get_db),
    admin: bool = Depends(deps.get_admin_user)
):
    return db.query(Prediction).order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/feedback", response_model=List[FeedbackResponse])
def get_all_feedback(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(deps.get_db),
    admin: bool = Depends(deps.get_admin_user)
):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()
