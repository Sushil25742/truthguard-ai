from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "TruthGuard AI API"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = "sqlite:///./truthguard.db"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # ML settings
    USE_MOCK_MODEL: bool = True
    MODEL_PATH: str = "../../ml/models/fake-news-distilbert"
    MAX_TEXT_LENGTH_FREE: int = 5000
    DAILY_LIMIT_FREE: int = 10

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore")

settings = Settings()
