from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.db.database import Base, engine
import app.models  # Crucial: import models so Base knows about them
from app.api import predict, history, feedback, admin

# Create DB tables for MVP
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected internal error occurred."}
    )

# Routers
app.include_router(predict.router, prefix=f"{settings.API_V1_STR}/predict", tags=["prediction"])
app.include_router(history.router, prefix=f"{settings.API_V1_STR}/predictions", tags=["history"])
app.include_router(feedback.router, prefix=f"{settings.API_V1_STR}/predictions", tags=["feedback"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])

@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok", "version": "1.0.0"}
