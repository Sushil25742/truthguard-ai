from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import datetime
from app.db.database import get_db
from app.models.api_usage import ApiUsage
from app.core.config import settings

def check_rate_limit(
    request: Request,
    db: Session = Depends(get_db)
) -> ApiUsage:
    """
    Dependency to enforce daily rate limits based on IP address.
    Returns the ApiUsage record so the route can increment it after success.
    """
    client_ip = request.client.host if request.client else "unknown"
    today = datetime.date.today()
    
    usage = db.query(ApiUsage).filter(
        ApiUsage.ip_address == client_ip,
        ApiUsage.date == today
    ).first()

    if not usage:
        usage = ApiUsage(ip_address=client_ip, date=today, request_count=0)
        db.add(usage)
        db.commit()
        db.refresh(usage)

    limit = settings.DAILY_LIMIT_FREE

    if usage.request_count >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily limit of {limit} predictions reached for your IP."
        )

    return usage

def increment_usage(db: Session, usage: ApiUsage):
    """
    Helper function to increment usage after a successful prediction.
    """
    if usage:
        usage.request_count += 1
        db.commit()
        db.refresh(usage)
