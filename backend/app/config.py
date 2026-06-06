from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Set

class Settings(BaseSettings):
    APP_NAME: str = "CaseFlow AI Backend"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./caseflow.db"
    GROQ_API_KEY: str = "mock_key_for_phase_1"
    
    # Phase 3: Document Storage Configuration
    UPLOAD_DIR: str = "./uploads"
    ALLOWED_MIME_TYPES: Set[str] = {
        "application/pdf", 
        "text/plain"
    }
    MAX_UPLOAD_SIZE_MB: int = 10

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()