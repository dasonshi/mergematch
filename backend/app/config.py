from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security - MUST be set in production
    # SECRET_KEY: Used for JWT signing, must be 32+ characters
    # Generate with: openssl rand -hex 32
    SECRET_KEY: str = ""

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

    # CRM Platform (OAuth)
    GHL_CLIENT_ID: str = ""
    GHL_CLIENT_SECRET: str = ""
    GHL_REDIRECT_URI: str = "http://localhost:8000/auth/callback"
    GHL_WEBHOOK_SECRET: str = ""
    GHL_APP_ID: str = ""  # Marketplace app ID
    GHL_APP_SHARED_SECRET: str = ""  # SSO shared secret from Marketplace
    GHL_CUSTOM_PAGE_LINK_ID: str = ""  # Custom page link ID for redirect after OAuth

    # GHL Marketplace Plan IDs (set these after creating plans in marketplace)
    # Format: comma-separated plan_id:tier pairs
    # Example: "abc123:free,def456:starter,ghi789:pro,jkl012:agency"
    GHL_PLAN_MAPPING: str = ""

    # Security
    TOKEN_ENCRYPTION_KEY: str = ""

    # Cron Job Security (for Render Cron Jobs)
    CRON_SECRET: str = ""

    # Frontend
    FRONTEND_URL: str = "http://localhost:8081"

    # CORS - comma-separated allowed origins (in addition to FRONTEND_URL and localhost)
    CORS_ALLOWED_ORIGINS: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
