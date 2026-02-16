from urllib.parse import urlencode
import httpx
from app.config import settings


class GHLOAuth:
    """Handle GoHighLevel OAuth flow."""

    AUTH_URL = "https://marketplace.gohighlevel.com/oauth/chooselocation"
    TOKEN_URL = "https://services.leadconnectorhq.com/oauth/token"
    LOCATION_TOKEN_URL = "https://services.leadconnectorhq.com/oauth/locationToken"

    # Required scopes for MergeMatch
    SCOPES = [
        "contacts.readonly",
        "contacts.write",
        "businesses.readonly",  # Companies
        "businesses.write",
        "opportunities.readonly",
        "opportunities.write",
        "locations.readonly",
        "locations/customFields.readonly",  # Custom field definitions
        "objects/schema.readonly",  # Object schemas
        "objects/record.readonly",  # Custom object records (read)
        "objects/record.write",  # Custom object records (write/delete)
        "associations/relation.readonly",  # Record associations (read)
        "associations/relation.write",  # Record associations (write/delete)
        "oauth.readonly",
        "oauth.write",
    ]

    def get_authorization_url(self, state: str) -> str:
        """Build the OAuth authorization URL."""
        params = {
            "response_type": "code",
            "client_id": settings.GHL_CLIENT_ID,
            "redirect_uri": settings.GHL_REDIRECT_URI,
            "scope": " ".join(self.SCOPES),
            "state": state,
        }
        return f"{self.AUTH_URL}?{urlencode(params)}"

    async def exchange_code(self, code: str) -> dict:
        """Exchange authorization code for access tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "client_id": settings.GHL_CLIENT_ID,
                    "client_secret": settings.GHL_CLIENT_SECRET,
                    "redirect_uri": settings.GHL_REDIRECT_URI,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            return response.json()

    async def refresh_token(self, refresh_token: str, user_type: str = "Location") -> dict:
        """Refresh an expired access token."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": settings.GHL_CLIENT_ID,
                    "client_secret": settings.GHL_CLIENT_SECRET,
                    "user_type": user_type,
                    "redirect_uri": settings.GHL_REDIRECT_URI,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            return response.json()

    async def get_location_token(self, agency_token: str, company_id: str, location_id: str) -> dict:
        """Exchange an agency (Company) token for a location-level token."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.LOCATION_TOKEN_URL,
                data={
                    "companyId": company_id,
                    "locationId": location_id,
                },
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": f"Bearer {agency_token}",
                    "Version": "2021-07-28",
                },
            )
            response.raise_for_status()
            return response.json()
