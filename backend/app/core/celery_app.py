"""
Celery application configuration.
Uses Redis as message broker for reliable job queue processing.
"""
import os
from celery import Celery

# Get Redis URL from environment (Upstash or other Redis provider)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create Celery app
celery_app = Celery(
    "mergematch",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.merge_tasks"],
)

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,

    # Retry settings
    task_acks_late=True,  # Acknowledge after task completes (enables retry on crash)
    task_reject_on_worker_lost=True,  # Requeue if worker dies

    # Rate limiting to avoid GHL API throttling
    task_default_rate_limit="10/s",

    # Result expiration (24 hours)
    result_expires=86400,

    # Worker settings
    worker_prefetch_multiplier=1,  # Process one task at a time for better control
    worker_concurrency=4,  # 4 concurrent workers

    # Task time limits
    task_soft_time_limit=300,  # 5 min soft limit (raises exception)
    task_time_limit=360,  # 6 min hard limit (kills task)
)
