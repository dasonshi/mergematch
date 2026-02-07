from urllib.parse import urlencode
import httpx
from app.config import settings


class GHLOAuth:
    """Handle GoHighLevel OAuth flow."""

    AUTH_URL = "https://marketplace.gohighlevel.com/oauth/chooselocation"
    TOKEN_URL = "https://services.leadconnectorhq.com/oauth/token"

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

    async def refresh_token(self, refresh_token: str) -> dict:
        """Refresh an expired access token."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": settings.GHL_CLIENT_ID,
                    "client_secret": settings.GHL_CLIENT_SECRET,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            return response.json()
