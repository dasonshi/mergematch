# Celery + Redis Setup Guide

This guide explains how to set up reliable job processing for MergeMatch using Celery and Redis.

## Architecture

```
Frontend (Vercel) → FastAPI (Render) → Redis (Upstash) ← Celery Worker (Render)
```

- **FastAPI**: Receives merge requests, queues them to Redis
- **Redis**: Message broker that holds pending jobs
- **Celery Worker**: Pulls jobs from Redis and executes them

## Step 1: Create Upstash Redis Database

1. Go to [upstash.com](https://upstash.com) and create a free account
2. Click "Create Database"
3. Choose a region close to your Render deployment (e.g., US-East-1)
4. Copy the **Redis URL** (looks like `rediss://default:xxx@xxx.upstash.io:6379`)

## Step 2: Add Redis URL to Render

1. Go to your MergeMatch service on Render
2. Click "Environment" tab
3. Add new environment variable:
   - Key: `REDIS_URL`
   - Value: (paste the Upstash Redis URL)
4. Click "Save Changes" - this will redeploy the API

## Step 3: Create Celery Worker Service on Render

1. Go to Render Dashboard → "New" → "Background Worker"
2. Connect to your GitHub repo (same as the API)
3. Configure:
   - **Name**: `mergematch-worker`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `celery -A worker.celery_app worker --loglevel=info --concurrency=2`
   - **Instance Type**: Starter ($7/mo) or higher

4. Add the same environment variables as your API service:
   - `REDIS_URL` (same Upstash URL)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `GHL_CLIENT_ID`
   - `GHL_CLIENT_SECRET`
   - `ENCRYPTION_KEY`

5. Click "Create Background Worker"

## Step 4: Verify Setup

1. Check Render logs for the worker - should show "celery@xxx ready"
2. Check API logs - should show "Celery task queue enabled"
3. Try a bulk merge - jobs should now be queued to Redis

## Monitoring

### Upstash Dashboard
- View Redis memory usage and command count
- Free tier: 10K commands/day, 256MB storage

### Render Logs
- Worker logs show task execution
- API logs show task queuing

## Troubleshooting

### "Connection refused" errors
- Check REDIS_URL is set correctly in both services
- Ensure Upstash allows connections from Render IPs

### Tasks not processing
- Check worker is running in Render
- Check worker logs for errors
- Verify REDIS_URL is identical in API and worker

### Tasks failing repeatedly
- Check worker logs for the specific error
- Tasks auto-retry up to 3 times with backoff
- Check GHL API rate limits

## Cost Summary

| Service | Cost |
|---------|------|
| Upstash Redis (free tier) | $0/mo |
| Render Background Worker | $7/mo (Starter) |
| **Total** | **$7/mo** |

## Local Development

To run locally without Redis:
```bash
# API will fall back to BackgroundTasks
unset REDIS_URL
uvicorn app.main:app --reload
```

To test with Redis locally:
```bash
# Start Redis (Docker)
docker run -d -p 6379:6379 redis

# Set Redis URL
export REDIS_URL=redis://localhost:6379/0

# Start worker in one terminal
celery -A worker.celery_app worker --loglevel=info

# Start API in another terminal
uvicorn app.main:app --reload
```
