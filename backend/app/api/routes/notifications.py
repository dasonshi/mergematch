"""
Notification routes for MergeMatch.
Handles in-app notifications for bulk operations.
"""
from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.core.security import get_current_user_flexible
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
async def list_notifications(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """
    List notifications for the current location.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    notifications = await get_notifications(
        location_id=user.location_id,
        limit=limit,
        offset=offset,
        unread_only=unread_only,
    )

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
        total=len(notifications),
        unread_count=unread,
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_notifications_count(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """
    Get count of unread notifications for the current location.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    count = await get_unread_count(user.location_id)

    return UnreadCountResponse(count=count)


@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """
    Mark a notification as read.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    result = await mark_as_read(notification_id)

    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"success": True, "id": notification_id}


@router.post("/mark-all-read")
async def mark_all_notifications_read(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """
    Mark all notifications as read for the current location.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    count = await mark_all_as_read(user.location_id)

    return {"success": True, "marked_count": count}


class CreateBulkMergeNotificationRequest(BaseModel):
    """Request model for creating a bulk merge notification."""
    rule_id: str
    rule_name: str
    success_count: int
    fail_count: int


@router.post("/", response_model=NotificationResponse)
async def create_notification_route(
    request: CreateBulkMergeNotificationRequest,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """
    Create a notification for a bulk merge operation.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    notification = await create_bulk_merge_notification(
        location_id=user.location_id,
        rule_id=request.rule_id,
        rule_name=request.rule_name,
        success_count=request.success_count,
        fail_count=request.fail_count,
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
