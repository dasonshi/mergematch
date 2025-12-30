# https://marketplace.gohighlevel.com/docs/Authorization/TargetUserAgency

On this page

This guide explains how the installation flow works for the Agency targeted APPs , how to obtain the access token.

## Overview[​](#overview "Direct link to Overview")

For apps whose Target User is set as Agency, the app will only be visible to the Agency Admin/Owner, and only they can install it.

* * *

## Installation Flow[​](#installation-flow "Direct link to Installation Flow")

1.  Install the app on your Agency account.
2.  After installation, the redirect URL will be triggered from our end, and the authorization code will be shared.
3.  Use this authorization code to exchange for an Access Token using the [Get Access Token](https://marketplace.gohighlevel.com/docs/ghl/oauth/get-access-token) API endpoint.

*   **Note:** The Access Token generated will be of user type company(Agency Level Token).

#### Sample Request[​](#sample-request "Direct link to Sample Request")

```
curl -X POST   https://services.leadconnectorhq.com/oauth/token  -H 'Accept: application/json'   -H 'Content-Type: application/x-www-form-urlencoded'   -d 'client_id=68a2fd84fab6670f45220ebf-megyp358'   -d 'client_secret=673011da-b03a-4768-bbff-0f45821cd6fe'   -d 'grant_type=authorization_code'   -d 'code=16d0b6ceb51350ba437870074ad25bc65e8c1d8d'   -d 'user_type=Company'
```

#### Sample Response[​](#sample-response "Direct link to Sample Response")

```
{  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoQ2xhc3MiOiJDb21wYW55IiwiYXV0aENsYQ",  "token_type": "Bearer",  "expires_in": 86399,  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoQ2xhc3MiOiJDb21wYW55IiwiYXV0aEN",  "scope": "locations.write",  "refreshTokenId": "68a2feef89153fe9b8d196bc",  "userType": "Company",  "companyId": "GNb7aIv4rQFVb9iwNl5K",  "isBulkInstallation": false,  "userId": "Rg6BRRiHh7dS9gJy3W8a"}
```

* * *
