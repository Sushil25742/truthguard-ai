from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import get_db

# Admin API Key from environment variables (fallback to simple key for dev)
ADMIN_API_KEY = getattr(settings, "ADMIN_API_KEY", "admin_secret_key")

def get_admin_user(x_api_key: str = Header(None)):
    """Simple API key protection for admin routes."""
    if not x_api_key or x_api_key != ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid or missing API Key"
        )
    return True

# Ensure get_db is re-exported
__all__ = ["get_db", "get_admin_user"]
