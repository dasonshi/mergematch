"""
Notification service for bulk operation status updates.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.db.supabase import get_supabase


async def create_notification(
    location_id: str,
    notification_type: str,
    title: str,
    message: str,
    metadata: Optional[Dict[str, Any]] = None,
    tenant_id: Optional[str] = None,
) -> dict:
    """
    Create a notification for a location.

    Args:
        location_id: The internal location UUID
        notification_type: Type of notification (bulk_merge, scan_complete, auto_merge)
        title: Notification title
        message: Notification message
        metadata: Additional data (rule_id, success_count, fail_count, etc.)
        tenant_id: The tenant UUID (optional, will be looked up if not provided)

    Returns:
        The created notification record
    """
    supabase = get_supabase()

    # Get tenant_id from location if not provided
    if not tenant_id:
        location = supabase.table("locations").select("tenant_id").eq("id", location_id).single().execute()
        if location.data:
            tenant_id = location.data["tenant_id"]

    notification_data = {
        "location_id": location_id,
        "tenant_id": tenant_id,
        "type": notification_type,
        "title": title,
        "message": message,
        "metadata": metadata or {},
        "read": False,
    }

    result = supabase.table("notifications").insert(notification_data).execute()
    return result.data[0] if result.data else None


async def get_notifications(
    location_id: str,
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False,
) -> List[dict]:
    """
    Get notifications for a location.

    Args:
        location_id: The internal location UUID
        limit: Maximum number of notifications to return
        offset: Offset for pagination
        unread_only: If True, only return unread notifications

    Returns:
        List of notification records
    """
    supabase = get_supabase()

    query = supabase.table("notifications").select("*").eq("location_id", location_id)

    if unread_only:
        query = query.eq("read", False)

    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)

    result = query.execute()
    return result.data or []


async def get_unread_count(location_id: str) -> int:
    """
    Get count of unread notifications for a location.

    Args:
        location_id: The internal location UUID

    Returns:
        Number of unread notifications
    """
    supabase = get_supabase()

    result = supabase.table("notifications").select("id", count="exact").eq("location_id", location_id).eq("read", False).execute()

    return result.count or 0


async def mark_as_read(notification_id: str) -> dict:
    """
    Mark a notification as read.

    Args:
        notification_id: The notification UUID

    Returns:
        The updated notification record
    """
    supabase = get_supabase()

    result = supabase.table("notifications").update({
        "read": True,
    }).eq("id", notification_id).execute()

    return result.data[0] if result.data else None


async def mark_all_as_read(location_id: str) -> int:
    """
    Mark all notifications as read for a location.

    Args:
        location_id: The internal location UUID

    Returns:
        Number of notifications marked as read
    """
    supabase = get_supabase()

    result = supabase.table("notifications").update({
        "read": True,
    }).eq("location_id", location_id).eq("read", False).execute()

    return len(result.data) if result.data else 0


async def create_bulk_merge_notification(
    location_id: str,
    rule_id: str,
    rule_name: str,
    success_count: int,
    fail_count: int,
    tenant_id: Optional[str] = None,
) -> dict:
    """
    Create a notification for a completed bulk merge operation.

    Args:
        location_id: The internal location UUID
        rule_id: The match rule UUID
        rule_name: The match rule name
        success_count: Number of successful merges
        fail_count: Number of failed merges
        tenant_id: The tenant UUID (optional)

    Returns:
        The created notification record
    """
    total = success_count + fail_count

    if fail_count == 0:
        title = "Bulk Merge Complete"
        message = f"Successfully merged {success_count} records for '{rule_name}'"
    elif success_count == 0:
        title = "Bulk Merge Failed"
        message = f"All {fail_count} merges failed for '{rule_name}'"
    else:
        title = "Bulk Merge Complete (with errors)"
        message = f"{success_count} merged, {fail_count} failed for '{rule_name}'"

    metadata = {
        "rule_id": rule_id,
        "rule_name": rule_name,
        "success_count": success_count,
        "fail_count": fail_count,
        "total_count": total,
    }

    return await create_notification(
        location_id=location_id,
        notification_type="bulk_merge",
        title=title,
        message=message,
        metadata=metadata,
        tenant_id=tenant_id,
    )
