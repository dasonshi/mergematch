# https://marketplace.gohighlevel.com/docs/ghl/saas/bulk-enable-saas-deprecated

# Bulk Enable SaaS

POST 

## https://services.leadconnectorhq.com/saas-api/public-api/bulk-enable-saas/:companyId

deprecated

This endpoint has been deprecated and may be replaced or removed in future versions of the API.

Enable SaaS mode for multiple locations with support for both SaaS v1 and v2

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-04-15`\]

API Version

### Path Parameters

**companyId** stringrequired

Company ID to enable SaaS for

Example: 5DP4iH6HLkQsiKESj6rh

*   application/json

### Body**required**

**locationIds** string\[\]required

Array of location IDs to enable SaaS for

Example:`["locationId1","locationId2"]`

**isSaaSV2** booleanrequired

Indicates if the SaaS is V2

Example:`true`

**actionPayload** object

Action payload for the bulk enable SaaS operation

**priceId** string

Price ID for the SaaS plan

Example:`price_1QDPY5FpU9DlKp7RQ8BXfywx`

**stripeAccountId** string

Stripe account ID

Example:`acct_1QDPY5FpU9DlKp7RQ8BXfywx`

**saasPlanId** stringrequired

SaaS plan ID

Example:`66c4d36534f21f900dc2a265`

**providerLocationId** string

Provider location ID

Example:`r06mdj4OrrERzYDvsOdh`

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   404
*   500

Bulk SaaS enable operation completed successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**success** booleanrequired

Indicates if the bulk enable SaaS operation was successful

Example:`true`

**message** stringrequired

Message indicating the bulk enable SaaS operation

Example:`Bulk enable SaaS operation completed successfully`

**bulkActionUrl** string

URL for the bulk enable SaaS operation

Example:`https://example.com/bulk-enable-saas`

```
{  "success": true,  "message": "Bulk enable SaaS operation completed successfully",  "bulkActionUrl": "https://example.com/bulk-enable-saas"}
```

Bad Request

*   application/json

*   Schema
*   Example (auto)

**Schema**

**statusCode** number

Status code

Example:`400`

**message** string

Error message

Example:`Bad Request`

```
{  "statusCode": 400,  "message": "Bad Request"}
```

Unauthorized

*   application/json

*   Schema
*   Example (auto)

**Schema**

**statusCode** number

Status code

Example:`401`

**message** string

Error message

Example:`Invalid token: access token is invalid`

**error** string

Error message

Example:`Unauthorized`

```
{  "statusCode": 401,  "message": "Invalid token: access token is invalid",  "error": "Unauthorized"}
```

Resource not found

*   application/json

*   Schema
*   Example (auto)

**Schema**

**statusCode** number

Status code

Example:`404`

**message** string

Error message

Example:`["Contact not found","User not found","Group not found","Channel not found"]`

```
{  "statusCode": 404,  "message": [    "Contact not found",    "User not found",    "Group not found",    "Channel not found"  ]}
```

Internal server error

*   application/json

*   Schema
*   Example (auto)

**Schema**

**statusCode** number

Status code

Example:`500`

**message** string

Error message

Example:`Internal Server Error`

```
{  "statusCode": 500,  "message": "Internal Server Error"}
```

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/saas/saas-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Company

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
curl -L 'https://services.leadconnectorhq.com/saas-api/public-api/bulk-enable-saas/:companyId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationIds": [    "locationId1",    "locationId2"  ],  "isSaaSV2": true,  "actionPayload": {    "priceId": "price_1QDPY5FpU9DlKp7RQ8BXfywx",    "stripeAccountId": "acct_1QDPY5FpU9DlKp7RQ8BXfywx",    "saasPlanId": "66c4d36534f21f900dc2a265",    "providerLocationId": "r06mdj4OrrERzYDvsOdh"  }}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

companyId — pathrequired

Version — headerrequired

\---2021-04-15

Body required

{
  "locationIds": \[    "locationId1",    "locationId2"  \],  "isSaaSV2": true,  "actionPayload": {    "priceId": "price\_1QDPY5FpU9DlKp7RQ8BXfywx",    "stripeAccountId": "acct\_1QDPY5FpU9DlKp7RQ8BXfywx",    "saasPlanId": "66c4d36534f21f900dc2a265",    "providerLocationId": "r06mdj4OrrERzYDvsOdh"  }
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
