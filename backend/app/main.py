"""
MergeMatch API - Duplicate detection & merge platform
"""
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.api.routes import auth, health, matches, rules, merges, webhooks, contacts, companies, fields, notifications, sync, cron, dedupe, jobs
from app.api.routes import settings as settings_routes
from app.core.security import validate_security_config
from app.core.rate_limit import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"Starting MergeMatch API ({settings.ENVIRONMENT})")

    # Validate security configuration
    validate_security_config()

    yield

    # Shutdown
    print("Shutting down MergeMatch API")


app = FastAPI(
    title="MergeMatch API",
    description="Duplicate detection & merge platform for CRM",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)

    # Prevent MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"

    # Clickjacking protection - allow GHL iframe embedding
    response.headers["Content-Security-Policy"] = (
        "frame-ancestors 'self' https://app.gohighlevel.com https://*.gohighlevel.com"
    )

    # XSS protection (legacy, but still useful)
    response.headers["X-XSS-Protection"] = "1; mode=block"

    # DNS prefetch control
    response.headers["X-DNS-Prefetch-Control"] = "off"

    # HSTS - Force HTTPS in production
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )

    # Don't expose framework info
    response.headers["X-Powered-By"] = ""

    return response


# CORS configuration
cors_origins = [
    settings.FRONTEND_URL,
    "http://localhost:8081",
    "http://localhost:3000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:3000",
]

# Add origins from env
if settings.CORS_ALLOWED_ORIGINS:
    cors_origins.extend(
        origin.strip() for origin in settings.CORS_ALLOWED_ORIGINS.split(",") if origin.strip()
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://app\.(gohighlevel|leadconnectorhq)\.com",
    allow_credentials=True,
    # SECURITY: Explicitly list allowed methods instead of wildcard
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    # SECURITY: Explicitly list allowed headers instead of wildcard
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "X-Requested-With",
        "X-GHL-Signature",
        "Version",
    ],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
)


# Routes
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(matches.router, prefix="/v1/matches", tags=["Matches"])
app.include_router(rules.router, prefix="/v1/rules", tags=["Rules"])
app.include_router(merges.router, prefix="/v1/merges", tags=["Merges"])
app.include_router(jobs.router, prefix="/v1/jobs", tags=["Jobs"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
app.include_router(contacts.router, prefix="/v1/contacts", tags=["Contacts"])
app.include_router(companies.router, prefix="/v1/companies", tags=["Companies"])
app.include_router(fields.router, prefix="/v1/fields", tags=["Fields"])
app.include_router(notifications.router, prefix="/v1/notifications", tags=["Notifications"])
app.include_router(sync.router, prefix="/v1/sync", tags=["Sync"])
app.include_router(cron.router, prefix="/cron", tags=["Cron"])
app.include_router(settings_routes.router, prefix="/v1/settings", tags=["Settings"])
app.include_router(dedupe.router, prefix="/v1/dedupe", tags=["Dedupe"])


@app.get("/")
@limiter.limit("10/minute")
async def root(request: Request):
    return {"message": "MergeMatch API", "docs": "/docs"}
