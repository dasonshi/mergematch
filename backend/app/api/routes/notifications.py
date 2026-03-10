"""
Notification routes for MergeMatch.
Handles in-app notifications for bulk operations.
"""
from fastapi import APIRouter, HTTPException, Query, Depends, Request
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.core.security import AuthenticatedUser
from app.core.deps import get_user
from app.core.rate_limit import limiter, RATE_LIMIT_DEFAULT
from app.db.supabase import get_supabase
from app.services.notification_service import (
    get_notifications,
    get_unread_count,
    mark_as_read,
    mark_all_as_read,
    create_bulk_merge_notification,
)

router = APIRouter()


class NotificationResponse(BaseModel):
    """Response model for a notification."""
    id: str
    type: str
    title: str
    message: Optional[str]
    metadata: Optional[Dict[str, Any]]
    read: bool
    created_at: str


class NotificationsListResponse(BaseModel):
    """Response model for notification list."""
    data: List[NotificationResponse]
    total: int
    unread_count: int


class UnreadCountResponse(BaseModel):
    """Response model for unread count."""
    count: int


@router.get("/", response_model=NotificationsListResponse)
@limiter.limit(RATE_LIMIT_DEFAULT)
async def list_notifications(
    request: Request,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False),
    user: AuthenticatedUser = Depends(get_user),
):
    """
    List notifications for the current location.
    """
    notifications = await get_notifications(
        location_id=user.location_id,
        limit=limit,
        offset=offset,
        unread_only=unread_only,
    )

    # Return full matching count (not current page length) for pagination semantics.
    supabase = get_supabase()
    total_query = supabase.table("notifications").select("id", count="exact").eq("location_id", user.location_id)
    if unread_only:
        total_query = total_query.eq("read", False)
    total_result = total_query.execute()
    total = total_result.count or 0

    unread = await get_unread_count(user.location_id)

    return NotificationsListResponse(
        data=[NotificationResponse(
            id=n["id"],
            type=n["type"],
            title=n["title"],
            message=n.get("message"),
            metadata=n.get("metadata"),
            read=n["read"],
            created_at=n["created_at"],
        ) for n in notifications],
        total=total,
        unread_count=unread,
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
@limiter.limit(RATE_LIMIT_DEFAULT)
async def get_unread_notifications_count(
    request: Request,
    user: AuthenticatedUser = Depends(get_user),
):
    """
    Get count of unread notifications for the current location.
    """
    count = await get_unread_count(user.location_id)

    return UnreadCountResponse(count=count)


@router.patch("/{notification_id}/read")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def mark_notification_read(
    request: Request,
    notification_id: str,
    user: AuthenticatedUser = Depends(get_user),
):
    """
    Mark a notification as read.
    """
    result = await mark_as_read(notification_id, user.location_id)

    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"success": True, "id": notification_id}


@router.post("/mark-all-read")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def mark_all_notifications_read(
    request: Request,
    user: AuthenticatedUser = Depends(get_user),
):
    """
    Mark all notifications as read for the current location.
    """
    count = await mark_all_as_read(user.location_id)

    return {"success": True, "marked_count": count}


class CreateBulkMergeNotificationRequest(BaseModel):
    """Request model for creating a bulk merge notification."""
    rule_id: str
    rule_name: str
    success_count: int
    fail_count: int


@router.post("/", response_model=NotificationResponse)
@limiter.limit(RATE_LIMIT_DEFAULT)
async def create_notification_route(
    request: Request,
    body: CreateBulkMergeNotificationRequest,
    user: AuthenticatedUser = Depends(get_user),
):
    """
    Create a notification for a bulk merge operation.
    """
    notification = await create_bulk_merge_notification(
        location_id=user.location_id,
        rule_id=body.rule_id,
        rule_name=body.rule_name,
        success_count=body.success_count,
        fail_count=body.fail_count,
        tenant_id=user.tenant_id,
    )

    if not notification:
        raise HTTPException(status_code=500, detail="Failed to create notification")

    return NotificationResponse(
        id=notification["id"],
        type=notification["type"],
        title=notification["title"],
        message=notification.get("message"),
        metadata=notification.get("metadata"),
        read=notification["read"],
        created_at=notification["created_at"],
    )
