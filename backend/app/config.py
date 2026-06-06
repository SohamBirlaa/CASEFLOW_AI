from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "CaseFlow AI Backend"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./caseflow.db"
    GROQ_API_KEY: str = "mock_key_for_phase_1"

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()