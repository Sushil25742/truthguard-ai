from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.api import deps
from app.core import rate_limit
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.models.prediction import Prediction
from app.models.api_usage import ApiUsage
from app.services.model_service import predict_fake_news
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/", response_model=PredictionResponse)
def analyze_text(
    request: Request,
    payload: PredictionRequest,
    db: Session = Depends(deps.get_db),
    usage: ApiUsage = Depends(rate_limit.check_rate_limit)
):
    # Sanitize input slightly
    clean_text = payload.text.strip()
    client_ip = request.client.host if request.client else "unknown"
    
    # 1. Validation limits
    if not clean_text or len(clean_text) < 50:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text must be at least 50 characters.")
    
    if len(clean_text) > 5000:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text is limited to 5000 characters per prediction.")

    # 2. Duplicate Request Protection
    yesterday = datetime.utcnow() - timedelta(days=1)
    existing_prediction = db.query(Prediction).filter(
        Prediction.ip_address == client_ip,
        Prediction.text_snippet == clean_text,
        Prediction.created_at >= yesterday
    ).first()

    if existing_prediction:
        # Return the cached prediction immediately WITHOUT incrementing API usage
        return existing_prediction
    
    # 3. Run mock inference
    result = predict_fake_news(clean_text)
    
    # Save to DB
    db_prediction = Prediction(
        ip_address=client_ip,
        text_snippet=clean_text,
        prediction=result["prediction"],
        confidence_score=result["confidence_score"],
        risk_level=result["risk_level"],
        explanation=result["explanation"],
        suspicious_phrases=result["suspicious_phrases"],
        model_version=result["model_version"]
    )
    db.add(db_prediction)
    
    # Increment usage limit
    if usage:
        usage.request_count += 1
        
    db.commit()
    db.refresh(db_prediction)

    return db_prediction
