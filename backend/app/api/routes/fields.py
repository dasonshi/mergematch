from fastapi import APIRouter, HTTPException, Query, Header
from typing import Optional, List, Dict, Any

from app.services.auth_service import get_location_tokens_with_refresh
from app.core.ghl.client import GHLClient
from app.core.security import get_current_user_flexible

router = APIRouter()

# Standard fields for each object type (fallback if API fails)
STANDARD_FIELDS = {
    "contacts": [
        {"id": "email", "name": "Email", "fieldKey": "contact.email", "dataType": "TEXT", "isCustom": False},
        {"id": "phone", "name": "Phone", "fieldKey": "contact.phone", "dataType": "PHONE", "isCustom": False},
        {"id": "firstName", "name": "First Name", "fieldKey": "contact.firstName", "dataType": "TEXT", "isCustom": False},
        {"id": "lastName", "name": "Last Name", "fieldKey": "contact.lastName", "dataType": "TEXT", "isCustom": False},
        {"id": "name", "name": "Full Name", "fieldKey": "contact.name", "dataType": "TEXT", "isCustom": False},
        {"id": "companyName", "name": "Company Name", "fieldKey": "contact.companyName", "dataType": "TEXT", "isCustom": False},
        {"id": "address1", "name": "Address", "fieldKey": "contact.address1", "dataType": "TEXT", "isCustom": False},
        {"id": "city", "name": "City", "fieldKey": "contact.city", "dataType": "TEXT", "isCustom": False},
        {"id": "state", "name": "State", "fieldKey": "contact.state", "dataType": "TEXT", "isCustom": False},
        {"id": "postalCode", "name": "Postal Code", "fieldKey": "contact.postalCode", "dataType": "TEXT", "isCustom": False},
        {"id": "country", "name": "Country", "fieldKey": "contact.country", "dataType": "TEXT", "isCustom": False},
        {"id": "website", "name": "Website", "fieldKey": "contact.website", "dataType": "TEXT", "isCustom": False},
        {"id": "dateOfBirth", "name": "Date of Birth", "fieldKey": "contact.dateOfBirth", "dataType": "DATE", "isCustom": False},
    ],
    "companies": [
        {"id": "name", "name": "Company Name", "fieldKey": "business.name", "dataType": "TEXT", "isCustom": False},
        {"id": "email", "name": "Email", "fieldKey": "business.email", "dataType": "TEXT", "isCustom": False},
        {"id": "phone", "name": "Phone", "fieldKey": "business.phone", "dataType": "PHONE", "isCustom": False},
        {"id": "website", "name": "Website", "fieldKey": "business.website", "dataType": "TEXT", "isCustom": False},
        {"id": "address", "name": "Address", "fieldKey": "business.address", "dataType": "TEXT", "isCustom": False},
        {"id": "city", "name": "City", "fieldKey": "business.city", "dataType": "TEXT", "isCustom": False},
        {"id": "state", "name": "State", "fieldKey": "business.state", "dataType": "TEXT", "isCustom": False},
        {"id": "postalCode", "name": "Postal Code", "fieldKey": "business.postalCode", "dataType": "TEXT", "isCustom": False},
        {"id": "country", "name": "Country", "fieldKey": "business.country", "dataType": "TEXT", "isCustom": False},
        {"id": "industry", "name": "Industry", "fieldKey": "business.industry", "dataType": "TEXT", "isCustom": False},
    ],
    "opportunities": [
        {"id": "name", "name": "Opportunity Name", "fieldKey": "opportunity.name", "dataType": "TEXT", "isCustom": False},
        {"id": "monetaryValue", "name": "Value", "fieldKey": "opportunity.monetaryValue", "dataType": "MONETARY", "isCustom": False},
        {"id": "status", "name": "Status", "fieldKey": "opportunity.status", "dataType": "TEXT", "isCustom": False},
    ],
}


def normalize_custom_field(field: Dict[str, Any], object_type: str) -> Dict[str, Any]:
    """Normalize a GHL custom field to our standard format."""
    return {
        "id": field.get("id") or field.get("fieldKey", "").split(".")[-1],
        "name": field.get("name", "Unknown Field"),
        "fieldKey": field.get("fieldKey", f"{object_type}.{field.get('id', '')}"),
        "dataType": field.get("dataType", "TEXT"),
        "isCustom": True,
    }


def normalize_object_field(field: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize a field from object schema response."""
    return {
        "id": field.get("id") or field.get("fieldKey", "").split(".")[-1],
        "name": field.get("name", "Unknown Field"),
        "fieldKey": field.get("fieldKey", ""),
        "dataType": field.get("dataType", "TEXT"),
        "isCustom": not field.get("standard", True),  # Assume custom if not marked standard
    }


@router.get("/{object_type}")
async def get_object_fields(
    object_type: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
) -> List[Dict[str, Any]]:
    """
    Get available fields for an object type.

    Fetches both standard fields and custom fields from GHL.
    Falls back to standard fields only if GHL API fails.

    object_type can be:
    - 'contacts' - Contact records
    - 'companies' - Business/Company records
    - 'opportunities' - Opportunity records
    - 'custom_objects.{key}' - Custom object records
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated or token refresh failed")

    # Start with standard fields (as fallback)
    standard_fields = STANDARD_FIELDS.get(object_type, [])

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        try:
            if object_type == "contacts":
                # Fetch contact custom fields
                custom_fields = await client.get_custom_fields(model="contact")
                normalized_custom = [
                    normalize_custom_field(f, "contact")
                    for f in custom_fields
                ]
                return standard_fields + normalized_custom

            elif object_type == "companies":
                # Try to fetch business object schema
                try:
                    schema = await client.get_object_schema("business", fetch_properties=True)
                    fields = schema.get("fields", [])
                    if fields:
                        return [normalize_object_field(f) for f in fields]
                except Exception:
                    pass  # Fall back to standard fields
                return standard_fields

            elif object_type == "opportunities":
                # Fetch opportunity custom fields
                try:
                    custom_fields = await client.get_custom_fields(model="opportunity")
                    normalized_custom = [
                        normalize_custom_field(f, "opportunity")
                        for f in custom_fields
                    ]
                    return standard_fields + normalized_custom
                except Exception:
                    pass
                return standard_fields

            elif object_type.startswith("custom_objects."):
                # Fetch custom object schema
                schema = await client.get_object_schema(object_type, fetch_properties=True)
                fields = schema.get("fields", [])
                return [normalize_object_field(f) for f in fields]

            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unknown object type: {object_type}"
                )

        except HTTPException:
            raise
        except Exception as e:
            # If GHL API fails, return standard fields as fallback
            if standard_fields:
                return standard_fields
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch fields: {str(e)}"
            )


@router.get("/")
async def list_available_objects(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
) -> List[Dict[str, Any]]:
    """
    List all available object types including custom objects.

    Returns standard objects plus any custom objects defined in the location.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated or token refresh failed")

    # Standard objects always available
    objects = [
        {"id": "contacts", "name": "Contacts", "standard": True},
        {"id": "companies", "name": "Companies", "standard": True},
        {"id": "opportunities", "name": "Opportunities", "standard": True},
    ]

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        try:
            # Fetch custom objects
            ghl_objects = await client.list_objects()
            for obj in ghl_objects:
                # Only add custom objects (standard ones already in list)
                if not obj.get("standard", True):
                    key = obj.get("key", "")
                    labels = obj.get("labels", {})
                    objects.append({
                        "id": key,
                        "name": labels.get("plural") or labels.get("singular") or key,
                        "standard": False,
                    })
        except Exception:
            # If fetching custom objects fails, just return standard ones
            pass

    return objects
