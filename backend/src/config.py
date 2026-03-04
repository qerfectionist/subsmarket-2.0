"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore extra .env vars
    )
    
    # App
    app_name: str = "SubsMarket"
    app_version: str = "2.0.0"
    debug: bool = False
    
    # Database (Neon PostgreSQL)
    database_url: str = "postgresql+asyncpg://user:pass@host/dbname"
    
    # Redis (optional)
    redis_url: str = "redis://localhost:6379/0"
    
    # Telegram
    telegram_bot_token: str = ""
    
    # Security — MUST be set via environment variable in production
    secret_key: str
    
    # CORS
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://localhost:8000",
        "https://subsmarket.vercel.app"  # Future production URL
    ]

    # Moderation
    admin_ids: list[int] = []


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
