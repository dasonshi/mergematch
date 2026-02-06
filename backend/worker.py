"""
Celery worker entry point.
Run with: celery -A worker.celery_app worker --loglevel=info
"""
from app.core.celery_app import celery_app

# Import tasks to register them
from app.tasks import merge_tasks  # noqa: F401

if __name__ == "__main__":
    celery_app.start()
