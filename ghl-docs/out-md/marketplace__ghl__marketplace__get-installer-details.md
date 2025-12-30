# https://marketplace.gohighlevel.com/docs/ghl/marketplace/get-installer-details

# Get Installer Details

GET 

## https://services.leadconnectorhq.com/marketplace/app/:appId/installations

Fetches installer details for the authenticated user. This endpoint returns information about the company, location, user, and installation details associated with the current OAuth token.

### Requirements

#### Scope(s)

`marketplace-installer-details.readonly`

#### Auth Method(s)

`OAuth Access Token`

#### Token Type(s)

`Sub-Account Token``Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Path Parameters

**appId** stringrequired

ID of the app to get installer details

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   403

Successfully retrieved installer details. Returns company, location, user, and installation information.

*   application/json

*   Schema
*   Example (auto)

**Schema**

**installationDetails** object

Installation details

**companyId** stringrequired

Company ID

Example:`company123`

**locationId** string

Location ID (if applicable)

Example:`location123`

**companyName** stringrequired

Company name

Example:`Example Company`

**companyEmail** stringrequired

Company email

Example:`contact@example.com`

**companyOwnerFullName** string

Company owner full name

Example:`John Doe`

**userId** stringrequired

User ID who installed the app

Example:`user123`

**isWhitelabelCompany** booleanrequired

Whether the company is a whitelabel company

Example:`false`

**companyHighLevelPlan** string

Company plan

Example:`agency_monthly_497`

**marketplaceAppPlanId** string

Marketplace app plan ID for paid apps

Example:`plan123`

**whitelabelDetails** object

Whitelabel details (only present if isWhitelabelCompany is true)

**domain** stringrequired

Domain of the whitelabel company

Example:`example.com`

**logoUrl** stringrequired

Logo URL of the whitelabel company

Example:`https://example.com/logo.png`

```
{  "installationDetails": {    "companyId": "company123",    "locationId": "location123",    "companyName": "Example Company",    "companyEmail": "contact@example.com",    "companyOwnerFullName": "John Doe",    "userId": "user123",    "isWhitelabelCompany": false,    "companyHighLevelPlan": "agency_monthly_497",    "marketplaceAppPlanId": "plan123",    "whitelabelDetails": {      "domain": "example.com",      "logoUrl": "https://example.com/logo.png"    }  }}
```

Bad Request. Invalid request parameters or missing required data.

Forbidden. The client does not have necessary permissions to access installer details.

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/marketplace/developer-marketplace-api#authentication)**type:** http**scopes:** `marketplace-installer-details.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account.

*   curl
*   nodejs
*   python
*   php
*   java
*   go
*   ruby
*   powershell

*   CURL

```
curl -L 'https://services.leadconnectorhq.com/marketplace/app/:appId/installations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Security Scheme

Location-Access-OnlyAgency-Access-Only

Bearer Token

Parameters

appId — pathrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
