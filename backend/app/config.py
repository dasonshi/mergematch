from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security - MUST be changed in production
    # SECRET_KEY: Used for JWT signing, must be 32+ characters
    SECRET_KEY: str = "change-me-in-production"

    # JWT Configuration
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    DATABASE_URL: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # GoHighLevel
    GHL_CLIENT_ID: str = ""
    GHL_CLIENT_SECRET: str = ""
    GHL_REDIRECT_URI: str = "http://localhost:8000/auth/callback"
    GHL_WEBHOOK_SECRET: str = ""
    GHL_APP_ID: str = ""  # Your GHL Marketplace app ID
    GHL_APP_SHARED_SECRET: str = ""  # SSO shared secret from GHL Marketplace

    # GHL Marketplace Plan IDs (set these after creating plans in marketplace)
    # Format: comma-separated plan_id:tier pairs
    # Example: "abc123:free,def456:starter,ghi789:pro,jkl012:agency"
    GHL_PLAN_MAPPING: str = ""

    # Security
    TOKEN_ENCRYPTION_KEY: str = ""

    # Frontend
    FRONTEND_URL: str = "http://localhost:8081"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
