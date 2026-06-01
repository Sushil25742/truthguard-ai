from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.api import deps
from app.schemas.prediction import PredictionResponse
from app.models.prediction import Prediction

router = APIRouter()

@router.get("/", response_model=List[PredictionResponse])
def get_predictions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50
):
    """Get recent global predictions."""
    predictions = db.query(Prediction).order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()
    return predictions

@router.get("/{id}", response_model=PredictionResponse)
def get_prediction(
    id: UUID,
    db: Session = Depends(deps.get_db)
):
    """Get a specific prediction by ID."""
    prediction = db.query(Prediction).filter(Prediction.id == id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return prediction
