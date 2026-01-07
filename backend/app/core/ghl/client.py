import httpx
import logging
from typing import Optional, List, Dict, Any
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)


class GHLClient:
    """GoHighLevel API Client with retry logic and rate limiting."""

    BASE_URL = "https://services.leadconnectorhq.com"
    API_VERSION = "2021-07-28"

    def __init__(self, access_token: str, location_id: str):
        self.access_token = access_token
        self.location_id = location_id
        self._client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Version": self.API_VERSION,
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )

    async def close(self):
        await self._client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.close()

    # ==================== CONTACTS ====================

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.TimeoutException)),
    )
    async def get_contacts(
        self,
        limit: int = 100,
        start_after: Optional[str] = None,
        query: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Fetch contacts with pagination."""
        params = {"locationId": self.location_id, "limit": limit}
        if start_after:
            params["startAfter"] = start_after
        if query:
            params["query"] = query

        response = await self._client.get("/contacts/", params=params)
        response.raise_for_status()
        return response.json()

    async def get_contact(self, contact_id: str) -> Dict[str, Any]:
        """Fetch a single contact by ID."""
        response = await self._client.get(f"/contacts/{contact_id}")
        response.raise_for_status()
        return response.json()

    async def search_contacts(
        self,
        limit: int = 1,
        filters: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Search contacts with filters. Returns total count."""
        body = {
            "locationId": self.location_id,
            "page": 1,
            "pageLimit": limit,
        }
        if filters:
            body["filters"] = filters
        response = await self._client.post("/contacts/search", json=body)
        response.raise_for_status()
        return response.json()

    async def get_contacts_count(self) -> int:
        """Get total contact count using POST /contacts/search (recommended endpoint)."""
        body = {
            "locationId": self.location_id,
            "page": 1,
            "pageLimit": 1,
        }
        logger.info(f"[GHL] POST /contacts/search with body: {body}")
        response = await self._client.post("/contacts/search", json=body)
        logger.info(f"[GHL] Response status: {response.status_code}")
        response.raise_for_status()
        data = response.json()
        logger.info(f"[GHL] Raw response keys: {list(data.keys()) if isinstance(data, dict) else 'not a dict'}")
        # Search endpoint returns 'total' for total count
        count = data.get("total") or data.get("count") or 0
        logger.info(f"[GHL] total field: {data.get('total', 'NOT FOUND')}, count field: {data.get('count', 'NOT FOUND')}")
        logger.info(f"[GHL] Returning count: {count}")
        return count

    async def update_contact(self, contact_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a contact."""
        response = await self._client.put(f"/contacts/{contact_id}", json=data)
        response.raise_for_status()
        return response.json()

    async def delete_contact(self, contact_id: str) -> None:
        """Delete a contact."""
        response = await self._client.delete(f"/contacts/{contact_id}")
        response.raise_for_status()

    async def create_contact(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new contact (for rollback)."""
        data["locationId"] = self.location_id
        response = await self._client.post("/contacts/", json=data)
        response.raise_for_status()
        return response.json()

    # ==================== COMPANIES ====================

    async def get_companies(self) -> Dict[str, Any]:
        """Fetch all companies (businesses) for this location.
        Note: GHL API doesn't support pagination for this endpoint.
        """
        params = {"locationId": self.location_id}
        logger.info(f"[GHL] GET /businesses/ with params: {params}")
        response = await self._client.get("/businesses/", params=params)
        logger.info(f"[GHL] Response status: {response.status_code}")
        response.raise_for_status()
        data = response.json()
        logger.info(f"[GHL] Raw response keys: {list(data.keys()) if isinstance(data, dict) else 'not a dict'}")
        businesses = data.get("businesses", [])
        logger.info(f"[GHL] Found {len(businesses)} businesses")
        return data

    async def get_company(self, company_id: str) -> Dict[str, Any]:
        """Fetch a single company."""
        response = await self._client.get(f"/businesses/{company_id}")
        response.raise_for_status()
        return response.json()

    async def update_company(self, company_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a company."""
        response = await self._client.put(f"/businesses/{company_id}", json=data)
        response.raise_for_status()
        return response.json()

    async def delete_company(self, company_id: str) -> None:
        """Delete a company."""
        response = await self._client.delete(f"/businesses/{company_id}")
        response.raise_for_status()

    # ==================== OPPORTUNITIES ====================

    async def get_opportunities(
        self,
        pipeline_id: Optional[str] = None,
        limit: int = 100,
    ) -> Dict[str, Any]:
        """Fetch opportunities."""
        params = {"location_id": self.location_id, "limit": limit}
        if pipeline_id:
            params["pipeline_id"] = pipeline_id

        response = await self._client.get("/opportunities/search", params=params)
        response.raise_for_status()
        return response.json()

    async def get_opportunity(self, opportunity_id: str) -> Dict[str, Any]:
        """Fetch a single opportunity."""
        response = await self._client.get(f"/opportunities/{opportunity_id}")
        response.raise_for_status()
        return response.json()

    # ==================== CUSTOM OBJECTS ====================

    async def get_custom_object_schemas(self) -> List[Dict[str, Any]]:
        """Get all custom object schemas for the location."""
        response = await self._client.get(
            "/custom-objects/",
            params={"locationId": self.location_id}
        )
        response.raise_for_status()
        return response.json().get("customObjects", [])

    async def get_custom_objects(
        self,
        schema_key: str,
        limit: int = 100,
    ) -> Dict[str, Any]:
        """Fetch records from a custom object."""
        response = await self._client.get(
            f"/custom-objects/{schema_key}/records",
            params={"locationId": self.location_id, "limit": limit}
        )
        response.raise_for_status()
        return response.json()

    # ==================== NOTES & TASKS (for reassignment) ====================

    async def get_contact_notes(self, contact_id: str) -> List[Dict[str, Any]]:
        """Get notes for a contact."""
        response = await self._client.get(f"/contacts/{contact_id}/notes")
        response.raise_for_status()
        return response.json().get("notes", [])

    async def get_contact_tasks(self, contact_id: str) -> List[Dict[str, Any]]:
        """Get tasks for a contact."""
        response = await self._client.get(f"/contacts/{contact_id}/tasks")
        response.raise_for_status()
        return response.json().get("tasks", [])

    # ==================== CUSTOM FIELDS & OBJECT SCHEMAS ====================

    async def get_custom_fields(self, model: str = "contact") -> List[Dict[str, Any]]:
        """Get custom field definitions for contacts or opportunities.

        Args:
            model: 'contact', 'opportunity', or 'all'

        Returns list of custom field definitions.
        """
        params = {"locationId": self.location_id}
        if model:
            params["model"] = model

        response = await self._client.get(
            f"/locations/{self.location_id}/customFields",
            params=params
        )
        response.raise_for_status()
        return response.json().get("customFields", [])

    async def get_object_schema(
        self,
        object_key: str,
        fetch_properties: bool = True
    ) -> Dict[str, Any]:
        """Get object schema with field definitions.

        Args:
            object_key: 'business', 'contact', 'opportunity', or 'custom_objects.{key}'
            fetch_properties: Whether to include field definitions

        Returns object schema with optional fields array.
        """
        params = {
            "locationId": self.location_id,
            "fetchProperties": str(fetch_properties).lower()
        }

        response = await self._client.get(f"/objects/{object_key}", params=params)
        response.raise_for_status()
        return response.json()

    async def list_objects(self) -> List[Dict[str, Any]]:
        """List all objects (standard + custom) for the location.

        Returns list of object definitions including custom objects.
        """
        response = await self._client.get(
            "/objects/",
            params={"locationId": self.location_id}
        )
        response.raise_for_status()
        return response.json().get("objects", [])
