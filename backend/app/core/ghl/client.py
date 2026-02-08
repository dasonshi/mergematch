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
        start_after_id: Optional[str] = None,
        start_after: Optional[int] = None,
        query: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Fetch contacts with pagination."""
        params = {"locationId": self.location_id, "limit": limit}
        if start_after:
            # Timestamp-based pagination (more reliable)
            params["startAfter"] = start_after
        elif start_after_id:
            params["startAfterId"] = start_after_id
        if query:
            params["query"] = query

        logger.info(f"[GHL] GET /contacts/ with params: {params}")
        response = await self._client.get("/contacts/", params=params)
        if response.status_code >= 400:
            logger.error(f"[GHL] Get contacts failed: {response.status_code} - {response.text[:500]}")
        response.raise_for_status()
        return response.json()

    async def get_contact(self, contact_id: str) -> Dict[str, Any]:
        """Fetch a single contact by ID."""
        response = await self._client.get(f"/contacts/{contact_id}")
        response.raise_for_status()
        return response.json()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.TimeoutException)),
    )
    async def search_duplicate_contact(
        self,
        email: Optional[str] = None,
        number: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Search for duplicate contacts by email and/or phone number.
        Uses GET /contacts/search/duplicate endpoint.

        Returns dict with 'contact' key (single match) or empty if no match.
        """
        params = {"locationId": self.location_id}
        if email:
            params["email"] = email
        if number:
            params["number"] = number

        if not email and not number:
            return {}

        logger.info(f"[GHL] GET /contacts/search/duplicate with params: {params}")
        response = await self._client.get("/contacts/search/duplicate", params=params)

        # GHL returns 400 when no duplicate found
        if response.status_code == 400:
            return {}

        if response.status_code >= 400:
            logger.error(f"[GHL] Duplicate search failed: {response.status_code} - {response.text[:500]}")
        response.raise_for_status()
        return response.json()

    async def search_contacts(
        self,
        page: int = 1,
        page_limit: int = 100,
        filters: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Search contacts with page-based pagination."""
        body = {
            "locationId": self.location_id,
            "page": page,
            "pageLimit": page_limit,
        }
        if filters:
            body["filters"] = filters
        logger.info(f"[GHL] POST /contacts/search page={page}, pageLimit={page_limit}")
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
        logger.info(f"[GHL] PUT /contacts/{contact_id} with data: {data}")
        response = await self._client.put(f"/contacts/{contact_id}", json=data)
        if response.status_code >= 400:
            error_detail = response.text
            logger.error(f"[GHL] Update contact failed: {response.status_code} - {error_detail}")
            # Raise with actual GHL error message
            raise Exception(f"GHL API error ({response.status_code}): {error_detail}")
        return response.json()

    async def delete_contact(self, contact_id: str) -> None:
        """Delete a contact."""
        response = await self._client.delete(f"/contacts/{contact_id}")
        if response.status_code >= 400:
            error_detail = response.text
            logger.error(f"[GHL] Delete contact failed: {response.status_code} - {error_detail}")
            raise Exception(f"GHL API error ({response.status_code}): {error_detail}")

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

    # ==================== PIPELINES ====================

    async def get_pipelines(self) -> List[Dict[str, Any]]:
        """Fetch all pipelines for the location."""
        logger.info(f"[GHL] GET /opportunities/pipelines for location {self.location_id}")
        response = await self._client.get(
            "/opportunities/pipelines",
            params={"locationId": self.location_id}
        )
        if response.status_code >= 400:
            logger.error(f"[GHL] Get pipelines failed: {response.status_code} - {response.text[:500]}")
        response.raise_for_status()
        return response.json().get("pipelines", [])

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

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.TimeoutException)),
    )
    async def search_opportunities(
        self,
        page: int = 1,
        page_limit: int = 100,
        pipeline_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Search opportunities with pagination."""
        params = {
            "location_id": self.location_id,
            "page": page,
            "limit": page_limit,
        }
        if pipeline_id:
            params["pipeline_id"] = pipeline_id

        logger.info(f"[GHL] GET /opportunities/search page={page}, limit={page_limit}")
        response = await self._client.get("/opportunities/search", params=params)
        if response.status_code >= 400:
            logger.error(f"[GHL] Search opportunities failed: {response.status_code} - {response.text[:500]}")
        response.raise_for_status()
        return response.json()

    async def get_opportunity(self, opportunity_id: str) -> Dict[str, Any]:
        """Fetch a single opportunity."""
        response = await self._client.get(f"/opportunities/{opportunity_id}")
        response.raise_for_status()
        return response.json()

    async def update_opportunity(self, opportunity_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an opportunity."""
        response = await self._client.put(f"/opportunities/{opportunity_id}", json=data)
        response.raise_for_status()
        return response.json()

    async def get_contact_opportunities(self, contact_id: str) -> List[Dict[str, Any]]:
        """Get all opportunities for a contact."""
        # Search opportunities with contact filter
        params = {
            "location_id": self.location_id,
            "contact_id": contact_id,
            "limit": 100,
        }
        response = await self._client.get("/opportunities/search", params=params)
        if response.status_code >= 400:
            # May not have permissions, return empty
            logger.warning(f"[GHL] Get contact opportunities failed: {response.status_code}")
            return []
        data = response.json()
        return data.get("opportunities", [])

    async def reassign_contact_opportunities(
        self,
        from_contact_id: str,
        to_contact_id: str,
        handling: str = "keep_all",
    ) -> int:
        """
        Reassign opportunities from one contact to another.

        Args:
            from_contact_id: Source contact (duplicate)
            to_contact_id: Target contact (master)
            handling: How to handle - "keep_all", "keep_master_only", "keep_highest_value"

        Returns count of opportunities reassigned.
        """
        if handling == "keep_master_only":
            # Don't reassign - master's opportunities are kept, duplicate's are orphaned (deleted with contact)
            logger.info(f"Opportunities handling: keep_master_only - not reassigning from {from_contact_id}")
            return 0

        opportunities = await self.get_contact_opportunities(from_contact_id)
        if not opportunities:
            return 0

        if handling == "keep_highest_value":
            # Sort by monetary value descending and only keep the highest
            sorted_opps = sorted(
                opportunities,
                key=lambda o: o.get("monetaryValue", 0) or 0,
                reverse=True
            )
            opportunities = sorted_opps[:1] if sorted_opps else []
            logger.info(f"Opportunities handling: keep_highest_value - selected {len(opportunities)} highest value")

        reassigned = 0
        for opp in opportunities:
            opp_id = opp.get("id")
            if opp_id:
                try:
                    await self.update_opportunity(opp_id, {"contactId": to_contact_id})
                    reassigned += 1
                except Exception as e:
                    logger.warning(f"Failed to reassign opportunity {opp_id}: {e}")

        logger.info(f"Reassigned {reassigned}/{len(opportunities)} opportunities from {from_contact_id} to {to_contact_id}")
        return reassigned

    # ==================== APPOINTMENTS ====================

    async def get_contact_appointments(self, contact_id: str) -> List[Dict[str, Any]]:
        """Get all appointments for a contact."""
        response = await self._client.get(f"/contacts/{contact_id}/appointments")
        if response.status_code >= 400:
            logger.warning(f"[GHL] Get contact appointments failed: {response.status_code}")
            return []
        data = response.json()
        return data.get("events", [])

    async def update_appointment(self, appointment_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an appointment (e.g., reassign contactId)."""
        response = await self._client.put(f"/calendars/events/appointments/{appointment_id}", json=data)
        if response.status_code >= 400:
            error_detail = response.text
            logger.error(f"[GHL] Update appointment failed: {response.status_code} - {error_detail}")
            raise Exception(f"GHL API error ({response.status_code}): {error_detail}")
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

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.TimeoutException)),
    )
    async def search_custom_objects(
        self,
        schema_key: str,
        page: int = 1,
        page_limit: int = 100,
        query: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Search custom object records with pagination.

        Uses POST /objects/{schemaKey}/records/search endpoint.
        Returns: { records: [...], total: int }
        """
        body = {
            "locationId": self.location_id,
            "page": page,
            "pageLimit": page_limit,
        }
        if query:
            body["query"] = query

        logger.info(f"[GHL] POST /objects/{schema_key}/records/search page={page}")
        response = await self._client.post(
            f"/objects/{schema_key}/records/search",
            json=body
        )
        if response.status_code >= 400:
            logger.error(f"[GHL] Search custom objects failed: {response.status_code} - {response.text[:500]}")
        response.raise_for_status()
        data = response.json()
        return {
            "records": data.get("records", []),
            "total": data.get("total", 0)
        }

    async def get_custom_object_record(
        self,
        schema_key: str,
        record_id: str,
    ) -> Dict[str, Any]:
        """Fetch a single custom object record by ID."""
        response = await self._client.get(
            f"/objects/{schema_key}/records/{record_id}",
            params={"locationId": self.location_id}
        )
        response.raise_for_status()
        return response.json()

    async def update_custom_object_record(
        self,
        schema_key: str,
        record_id: str,
        properties: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Update a custom object record."""
        logger.info(f"[GHL] PUT /objects/{schema_key}/records/{record_id}")
        response = await self._client.put(
            f"/objects/{schema_key}/records/{record_id}",
            params={"locationId": self.location_id},
            json={"properties": properties}
        )
        if response.status_code >= 400:
            error_detail = response.text
            logger.error(f"[GHL] Update custom object failed: {response.status_code} - {error_detail}")
            raise Exception(f"GHL API error ({response.status_code}): {error_detail}")
        return response.json()

    async def delete_custom_object_record(
        self,
        schema_key: str,
        record_id: str,
    ) -> bool:
        """Delete a custom object record."""
        logger.info(f"[GHL] DELETE /objects/{schema_key}/records/{record_id}")
        # Note: GHL API does not accept locationId for DELETE - it's inferred from the token
        response = await self._client.delete(
            f"/objects/{schema_key}/records/{record_id}"
        )
        if response.status_code >= 400:
            error_detail = response.text
            logger.error(f"[GHL] Delete custom object failed: {response.status_code} - {error_detail}")
            raise Exception(f"GHL API error ({response.status_code}): {error_detail}")
        return True

    async def create_custom_object_record(
        self,
        schema_key: str,
        properties: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Create a custom object record (for rollback)."""
        logger.info(f"[GHL] POST /objects/{schema_key}/records")
        # Note: Location is determined by the Sub-Account Token, not passed in body
        response = await self._client.post(
            f"/objects/{schema_key}/records",
            json={"properties": properties}
        )
        if response.status_code >= 400:
            error_detail = response.text
            logger.error(f"[GHL] Create custom object failed: {response.status_code} - {error_detail}")
            raise Exception(f"GHL API error ({response.status_code}): {error_detail}")
        return response.json()

    # ==================== NOTES & TASKS (for reassignment) ====================

    async def get_contact_notes(self, contact_id: str) -> List[Dict[str, Any]]:
        """Get notes for a contact."""
        response = await self._client.get(f"/contacts/{contact_id}/notes")
        response.raise_for_status()
        return response.json().get("notes", [])

    async def create_contact_note(self, contact_id: str, body: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a note on a contact."""
        payload = {"body": body}
        if user_id:
            payload["userId"] = user_id
        response = await self._client.post(f"/contacts/{contact_id}/notes", json=payload)
        response.raise_for_status()
        return response.json()

    async def get_contact_tasks(self, contact_id: str) -> List[Dict[str, Any]]:
        """Get tasks for a contact."""
        response = await self._client.get(f"/contacts/{contact_id}/tasks")
        response.raise_for_status()
        return response.json().get("tasks", [])

    async def create_contact_task(
        self,
        contact_id: str,
        title: str,
        body: Optional[str] = None,
        due_date: Optional[str] = None,
        completed: bool = False,
        assigned_to: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a task on a contact."""
        payload = {"title": title, "completed": completed}
        if body:
            payload["body"] = body
        if due_date:
            payload["dueDate"] = due_date
        if assigned_to:
            payload["assignedTo"] = assigned_to
        response = await self._client.post(f"/contacts/{contact_id}/tasks", json=payload)
        response.raise_for_status()
        return response.json()

    # ==================== RELATED RECORDS REASSIGNMENT ====================

    async def reassign_contact_notes(self, from_contact_id: str, to_contact_id: str) -> int:
        """
        Move all notes from one contact to another.
        GHL doesn't support moving, so we copy (create on target).
        Original notes remain on source and are deleted when contact is deleted.

        Returns count of notes copied.
        """
        notes = await self.get_contact_notes(from_contact_id)
        copied = 0
        for note in notes:
            body = note.get("body", "")
            if body:
                try:
                    await self.create_contact_note(to_contact_id, body)
                    copied += 1
                except Exception as e:
                    logger.warning(f"Failed to copy note to {to_contact_id}: {e}")
        logger.info(f"Copied {copied}/{len(notes)} notes from {from_contact_id} to {to_contact_id}")
        return copied

    async def reassign_contact_tasks(self, from_contact_id: str, to_contact_id: str) -> int:
        """
        Move all tasks from one contact to another.
        GHL doesn't support moving, so we copy (create on target).
        Original tasks remain on source and are deleted when contact is deleted.

        Returns count of tasks copied.
        """
        tasks = await self.get_contact_tasks(from_contact_id)
        copied = 0
        for task in tasks:
            title = task.get("title", "")
            if title:
                try:
                    await self.create_contact_task(
                        contact_id=to_contact_id,
                        title=title,
                        body=task.get("body"),
                        due_date=task.get("dueDate"),
                        completed=task.get("completed", False),
                        assigned_to=task.get("assignedTo"),
                    )
                    copied += 1
                except Exception as e:
                    logger.warning(f"Failed to copy task to {to_contact_id}: {e}")
        logger.info(f"Copied {copied}/{len(tasks)} tasks from {from_contact_id} to {to_contact_id}")
        return copied

    # ==================== CUSTOM FIELDS & OBJECT SCHEMAS ====================

    async def get_custom_fields(self, model: str = "contact") -> List[Dict[str, Any]]:
        """Get custom field definitions for contacts or opportunities.

        Args:
            model: 'contact', 'opportunity', or 'all'

        Returns list of custom field definitions.
        """
        # Use the locations endpoint which supports contact/opportunity custom fields
        # GET /locations/:locationId/customFields?model=contact
        url = f"/locations/{self.location_id}/customFields"
        params = {"model": model}
        logger.info(f"[GHL] GET {url} with params: {params}")

        response = await self._client.get(url, params=params)
        logger.info(f"[GHL] Custom fields response status: {response.status_code}")

        if response.status_code >= 400:
            logger.error(f"[GHL] Custom fields error: {response.text}")

        response.raise_for_status()
        data = response.json()
        logger.info(f"[GHL] Custom fields response keys: {list(data.keys()) if isinstance(data, dict) else 'not dict'}")
        custom_fields = data.get("customFields", [])
        logger.info(f"[GHL] Found {len(custom_fields)} custom fields")
        return custom_fields

    async def create_custom_field(
        self,
        name: str,
        data_type: str = "TEXT",
        model: str = "contact"
    ) -> Dict[str, Any]:
        """Create a custom field for contacts or opportunities.

        Args:
            name: Display name of the field
            data_type: TEXT, LARGE_TEXT, NUMERICAL, PHONE, EMAIL, MONETARY, etc.
            model: 'contact' or 'opportunity'

        Returns created custom field definition.
        """
        payload = {
            "name": name,
            "dataType": data_type,
            "model": model,
        }
        response = await self._client.post(
            f"/locations/{self.location_id}/customFields",
            json=payload
        )
        response.raise_for_status()
        return response.json()

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

    # ==================== ASSOCIATIONS ====================

    async def get_associations_for_object(self, object_key: str) -> List[Dict[str, Any]]:
        """Get all associations defined for an object type.

        Args:
            object_key: 'contact', 'business', 'opportunity', or 'custom_objects.{key}'

        Returns list of associations with related object info.
        """
        response = await self._client.get(
            f"/associations/objectKey/{object_key}",
            params={"locationId": self.location_id}
        )
        if response.status_code >= 400:
            logger.warning(f"[GHL] Get associations failed: {response.status_code} - {response.text}")
            return []
        return response.json().get("associations", [])

    async def get_relations_for_record(self, record_id: str) -> List[Dict[str, Any]]:
        """Get all related records for a specific record.

        Args:
            record_id: The ID of the record (contact, opportunity, etc.)

        Returns list of related records with their data.
        """
        response = await self._client.get(
            f"/associations/relations/{record_id}",
            params={"locationId": self.location_id}
        )
        if response.status_code >= 400:
            logger.warning(f"[GHL] Get relations failed: {response.status_code} - {response.text}")
            return []
        return response.json().get("relations", [])

    async def create_relation(
        self,
        source_object_key: str,
        source_record_id: str,
        target_object_key: str,
        target_record_id: str,
        association_id: str,
    ) -> Dict[str, Any]:
        """Create a relation between two records.

        Args:
            source_object_key: Object type of source record
            source_record_id: ID of source record
            target_object_key: Object type of target record
            target_record_id: ID of target record
            association_id: The association definition ID

        Returns created relation.
        """
        payload = {
            "locationId": self.location_id,
            "sourceObjectKey": source_object_key,
            "sourceRecordId": source_record_id,
            "targetObjectKey": target_object_key,
            "targetRecordId": target_record_id,
            "associationId": association_id,
        }
        response = await self._client.post("/associations/relations", json=payload)
        if response.status_code >= 400:
            error_detail = response.text
            logger.error(f"[GHL] Create relation failed: {response.status_code} - {error_detail}")
            raise Exception(f"GHL API error ({response.status_code}): {error_detail}")
        return response.json()

    async def delete_relation(self, relation_id: str) -> None:
        """Delete a relation between two records."""
        response = await self._client.delete(f"/associations/relations/{relation_id}")
        if response.status_code >= 400:
            error_detail = response.text
            logger.error(f"[GHL] Delete relation failed: {response.status_code} - {error_detail}")
            raise Exception(f"GHL API error ({response.status_code}): {error_detail}")
