from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List, Dict, Any
import logging

from app.core.ghl.client import GHLClient
from app.core.deps import get_auth_context, AuthContext

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/{object_type}/stats")
async def get_object_stats(
    object_type: str,
    ctx: AuthContext = Depends(get_auth_context),
) -> Dict[str, Any]:
    """
    Get record count for any object type (contacts, companies, custom objects).

    Returns: {"total": int}
    """
    async with GHLClient(ctx.access_token, ctx.ghl_location_id) as client:
        try:
            if object_type == "contacts":
                total = await client.get_contacts_count()
            elif object_type == "companies":
                result = await client.get_companies()
                total = len(result.get("businesses", []))
            elif object_type.startswith("custom_objects."):
                # Use search endpoint to get count
                result = await client.search_custom_objects(object_type, page=1, page_limit=1)
                total = result.get("total", 0)
            else:
                raise HTTPException(status_code=400, detail=f"Unknown object type: {object_type}")

            return {"total": total}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to get stats for {object_type}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

# Standard fields for each object type (fallback if API fails)
STANDARD_FIELDS = {
    "contacts": [
        {"id": "email", "name": "Email", "fieldKey": "contact.email", "dataType": "EMAIL", "isCustom": False},
        {"id": "phone", "name": "Phone", "fieldKey": "contact.phone", "dataType": "PHONE", "isCustom": False},
        {"id": "firstName", "name": "First Name", "fieldKey": "contact.firstName", "dataType": "TEXT", "isCustom": False},
        {"id": "lastName", "name": "Last Name", "fieldKey": "contact.lastName", "dataType": "TEXT", "isCustom": False},
        {"id": "name", "name": "Full Name", "fieldKey": "contact.name", "dataType": "TEXT", "isCustom": False},
        {"id": "companyName", "name": "Company Name", "fieldKey": "contact.companyName", "dataType": "TEXT", "isCustom": False},
        {"id": "address1", "name": "Address", "fieldKey": "contact.address1", "dataType": "TEXT", "isCustom": False},
        {"id": "city", "name": "City", "fieldKey": "contact.city", "dataType": "TEXT", "isCustom": False},
        {"id": "state", "name": "State", "fieldKey": "contact.state", "dataType": "SINGLE_OPTIONS", "isCustom": False},
        {"id": "postalCode", "name": "Postal Code", "fieldKey": "contact.postalCode", "dataType": "TEXT", "isCustom": False},
        {"id": "country", "name": "Country", "fieldKey": "contact.country", "dataType": "SINGLE_OPTIONS", "isCustom": False},
        {"id": "website", "name": "Website", "fieldKey": "contact.website", "dataType": "URL", "isCustom": False},
        {"id": "dateOfBirth", "name": "Date of Birth", "fieldKey": "contact.dateOfBirth", "dataType": "DATE", "isCustom": False},
    ],
    "companies": [
        {"id": "name", "name": "Company Name", "fieldKey": "business.name", "dataType": "TEXT", "isCustom": False},
        {"id": "email", "name": "Email", "fieldKey": "business.email", "dataType": "EMAIL", "isCustom": False},
        {"id": "phone", "name": "Phone", "fieldKey": "business.phone", "dataType": "PHONE", "isCustom": False},
        {"id": "website", "name": "Website", "fieldKey": "business.website", "dataType": "URL", "isCustom": False},
        {"id": "address", "name": "Address", "fieldKey": "business.address", "dataType": "TEXT", "isCustom": False},
        {"id": "city", "name": "City", "fieldKey": "business.city", "dataType": "TEXT", "isCustom": False},
        {"id": "state", "name": "State", "fieldKey": "business.state", "dataType": "SINGLE_OPTIONS", "isCustom": False},
        {"id": "postalCode", "name": "Postal Code", "fieldKey": "business.postalCode", "dataType": "TEXT", "isCustom": False},
        {"id": "country", "name": "Country", "fieldKey": "business.country", "dataType": "SINGLE_OPTIONS", "isCustom": False},
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


def normalize_object_field(field: Dict[str, Any], use_key_as_id: bool = False) -> Dict[str, Any]:
    """Normalize a field from object schema response.

    Args:
        field: The field definition from GHL API
        use_key_as_id: If True, extract the field key from fieldKey (e.g., 'transaction_id'
                       from 'custom_objects.transactions.transaction_id') instead of using
                       the GHL field ID. This is needed for custom objects where records
                       store data with the key, not the ID.
    """
    field_key = field.get("fieldKey", "")

    if use_key_as_id and field_key:
        # For custom objects, use the last segment of fieldKey as the ID
        # e.g., 'custom_objects.transactions.transaction_id' -> 'transaction_id'
        field_id = field_key.split(".")[-1]
    else:
        # For standard objects, use the GHL ID
        field_id = field.get("id") or field_key.split(".")[-1]

    return {
        "id": field_id,
        "name": field.get("name", "Unknown Field"),
        "fieldKey": field_key,
        "dataType": field.get("dataType", "TEXT"),
        "isCustom": not field.get("standard", True),  # Assume custom if not marked standard
    }


@router.get("/{object_type}")
async def get_object_fields(
    object_type: str,
    ctx: AuthContext = Depends(get_auth_context),
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
    # Start with standard fields (as fallback)
    standard_fields = STANDARD_FIELDS.get(object_type, [])

    async with GHLClient(ctx.access_token, ctx.ghl_location_id) as client:
        try:
            if object_type == "contacts":
                # Fetch contact custom fields
                try:
                    custom_fields = await client.get_custom_fields(model="contact")
                    logger.info(f"Fetched {len(custom_fields)} custom fields for contacts")
                    normalized_custom = [
                        normalize_custom_field(f, "contact")
                        for f in custom_fields
                    ]
                    logger.info(f"Returning {len(standard_fields)} standard + {len(normalized_custom)} custom fields")
                    return standard_fields + normalized_custom
                except Exception as e:
                    logger.warning(f"Failed to fetch contact custom fields: {e}")
                    return standard_fields

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
                # Use key-based IDs for custom objects (records use fieldKey, not ID)
                schema = await client.get_object_schema(object_type, fetch_properties=True)
                fields = schema.get("fields", [])
                return [normalize_object_field(f, use_key_as_id=True) for f in fields]

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
    ctx: AuthContext = Depends(get_auth_context),
) -> List[Dict[str, Any]]:
    """
    List all available object types including custom objects.

    Returns standard objects plus any custom objects defined in the location.
    """
    # Standard objects always available
    objects = [
        {"id": "contacts", "name": "Contacts", "standard": True},
        {"id": "companies", "name": "Companies", "standard": True},
        {"id": "opportunities", "name": "Opportunities", "standard": True},
    ]

    # Known standard object keys to filter out
    STANDARD_KEYS = {"contact", "business", "opportunity", "conversation", "appointment", "task", "note"}

    async with GHLClient(ctx.access_token, ctx.ghl_location_id) as client:
        try:
            # Fetch custom objects
            ghl_objects = await client.list_objects()
            for obj in ghl_objects:
                key = obj.get("key", "")
                # Check if it's a custom object:
                # - standard: false OR isSystemDefined: false
                # - OR key is not in standard keys
                # - OR key starts with custom_objects.
                is_standard = obj.get("standard", obj.get("isSystemDefined", True))
                is_standard_key = key.lower() in STANDARD_KEYS

                if not is_standard or (not is_standard_key and key):
                    # Skip if already added via standard list
                    if key.lower() in STANDARD_KEYS:
                        continue

                    labels = obj.get("labels", {})
                    objects.append({
                        "id": key,
                        "name": labels.get("plural") or labels.get("singular") or obj.get("name") or key,
                        "standard": False,
                    })
        except Exception as e:
            # If fetching custom objects fails, just return standard ones
            import logging
            logging.warning(f"Failed to fetch custom objects: {e}")
            pass

    return objects


# Known associations for each object type (fallback if API returns empty)
KNOWN_ASSOCIATIONS = {
    "contacts": [
        {"id": "notes", "name": "Notes", "objectKey": "notes", "canReassign": True},
        {"id": "tasks", "name": "Tasks", "objectKey": "tasks", "canReassign": True},
        {"id": "opportunities", "name": "Opportunities", "objectKey": "opportunity", "canReassign": True},
        {"id": "conversations", "name": "Conversations", "objectKey": "conversations", "canReassign": False},
        {"id": "appointments", "name": "Appointments", "objectKey": "appointments", "canReassign": False},
    ],
    "companies": [
        {"id": "contacts", "name": "Contacts", "objectKey": "contact", "canReassign": True},
    ],
    "opportunities": [
        {"id": "contacts", "name": "Contacts", "objectKey": "contact", "canReassign": True},
    ],
}


@router.get("/{object_type}/associations")
async def get_object_associations(
    object_type: str,
    ctx: AuthContext = Depends(get_auth_context),
) -> List[Dict[str, Any]]:
    """
    Get associated/related objects for a given object type.

    Returns list of objects that can be associated with the source object,
    along with their handling options (copy, don't copy, custom logic).

    object_type can be:
    - 'contacts' - Returns notes, tasks, opportunities, etc.
    - 'companies' - Returns contacts
    - 'opportunities' - Returns contacts
    - 'custom_objects.{key}' - Returns defined associations
    """
    # Start with known associations as fallback
    known = KNOWN_ASSOCIATIONS.get(object_type, [])

    async with GHLClient(ctx.access_token, ctx.ghl_location_id) as client:
        try:
            # Try to fetch associations from GHL API
            ghl_associations = await client.get_associations_for_object(object_type)

            if ghl_associations:
                # Map GHL associations to our format
                associations = []
                for assoc in ghl_associations:
                    target_key = assoc.get("targetObjectKey", "")
                    labels = assoc.get("labels", {})
                    associations.append({
                        "id": assoc.get("id", target_key),
                        "name": labels.get("plural") or labels.get("singular") or target_key,
                        "objectKey": target_key,
                        "associationId": assoc.get("id"),
                        "relationshipType": assoc.get("relationshipType", "one_to_many"),
                        "canReassign": True,  # Assume reassignable via API
                    })

                # Merge with known associations (add any missing standard ones)
                known_keys = {k["objectKey"] for k in known}
                for assoc in associations:
                    if assoc["objectKey"] not in known_keys:
                        known.append(assoc)

            return known

        except Exception as e:
            # If GHL API fails, return known associations
            if known:
                return known
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch associations: {str(e)}"
            )


@router.get("/pipelines")
async def get_pipelines(
    ctx: AuthContext = Depends(get_auth_context),
) -> List[Dict[str, Any]]:
    """
    Get all pipelines and their stages for the location.

    Returns list of pipelines with their stages for use in dropdown selectors.
    """
    async with GHLClient(ctx.access_token, ctx.ghl_location_id) as client:
        try:
            pipelines = await client.get_pipelines()
            # Flatten stages from all pipelines for easy selection
            result = []
            for pipeline in pipelines:
                pipeline_name = pipeline.get("name", "Unknown Pipeline")
                pipeline_id = pipeline.get("id", "")
                stages = pipeline.get("stages", [])

                result.append({
                    "id": pipeline_id,
                    "name": pipeline_name,
                    "stages": [
                        {
                            "id": stage.get("id", ""),
                            "name": stage.get("name", "Unknown Stage"),
                            "pipelineId": pipeline_id,
                            "pipelineName": pipeline_name,
                        }
                        for stage in stages
                    ]
                })
            return result
        except Exception as e:
            # Return empty array if pipelines can't be fetched (e.g., missing scope)
            # This allows the form to work without pipeline filtering
            logger.warning(f"Failed to fetch pipelines (may need opportunities.readonly scope): {str(e)}")
            return []
