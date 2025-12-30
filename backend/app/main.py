from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api.routes import auth, health, matches, rules, merges, jobs, webhooks, contacts, companies


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"Starting MergeMatch API ({settings.ENVIRONMENT})")
    yield
    # Shutdown
    print("Shutting down MergeMatch API")


app = FastAPI(
    title="MergeMatch API",
    description="Duplicate detection & merge platform for GoHighLevel",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS - allow localhost in development
cors_origins = [
    settings.FRONTEND_URL,
    "http://localhost:8081",
    "http://localhost:3000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:3000",
]

# Add production origins
if settings.ENVIRONMENT == "production":
    cors_origins.extend([
        "https://mergematch.app",
        "https://www.mergematch.app",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.(gohighlevel|leadconnectorhq)\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.get("/")
async def root():
    return {"message": "MergeMatch API", "docs": "/docs"}
