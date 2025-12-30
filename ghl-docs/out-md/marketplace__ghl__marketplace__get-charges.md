# https://marketplace.gohighlevel.com/docs/ghl/marketplace/get-charges

# Get all wallet charges

GET 

## https://services.leadconnectorhq.com/marketplace/billing/charges

Get all wallet charges

### Requirements

#### Scope(s)

`charges.readonly`

#### Auth Method(s)

`OAuth Access Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Query Parameters

**meterId** string

Billing Meter ID (you can find this on your app's pricing page on the developer portal)

**eventId** string

Event ID / Transaction ID

**userId** string

Filter results by User ID that your server passed via API when the charge was created

**startDate** string

Filter results AFTER a specific date. Use this in combination with endDate to filter results in a specific time window.

Example: 2025-03-26

**endDate** string

Filter results BEFORE a specific date. Use this in combination with startDate to filter results in a specific time window.

Example: 2025-03-26

**skip** number

Number of records to skip

**limit** number

Maximum number of records to return

## Responses[​](#responses "Direct link to Responses")

*   200
*   422

Returns list of wallet charges

*   application/json

*   Schema
*   Example (auto)

**Schema**

**charges** object\[\]

*   Array \[
    

**refunded** boolean

Value is 'true' if the charge has subsequently been refunded.

**currency** string

Currency of the transaction. We currently support USD only.

**appId** string

App ID

**meterId** string

Billing Meter ID (you can find this on your app's pricing page)

**chargeId** string

Charge ID

**entityType** string

Indicates who was charged? Currently, we support charges for 'location' only

**entityId** string

If the entityType is Location, entityld would be locationld.

**amountCharged** number

Total amount charged

**pricePerUnit** number

Price per unit for the charge

**transactionType** string

This can be one of two values - 'charge' or 'refund'

**units** number

Number of units that the sub-account was charged for

**meta** object

meta object contains details that were sent while creating the charge via the API - eventID, description, eventTime, userld

**createdAt** date-time

Timestamp when the charge was created in our system

**updatedAt** date-time

Timestamp when the charge was last updated in our system

*   \]
    

**total** number

```
{  "charges": [    {      "refunded": true,      "currency": "string",      "appId": "string",      "meterId": "string",      "chargeId": "string",      "entityType": "string",      "entityId": "string",      "amountCharged": 0,      "pricePerUnit": 0,      "transactionType": "string",      "units": 0,      "meta": {},      "createdAt": "2024-07-29T15:51:28.071Z",      "updatedAt": "2024-07-29T15:51:28.071Z"    }  ],  "total": 0}
```

Unprocessable Entity

*   application/json

*   Schema
*   Example (auto)

**Schema**

**statusCode** number

Example:`422`

**message** string\[\]

Example:`["Unprocessable Entity"]`

**error** string

Example:`Unprocessable Entity`

```
{  "statusCode": 422,  "message": [    "Unprocessable Entity"  ],  "error": "Unprocessable Entity"}
```

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/marketplace/developer-marketplace-api#authentication)**type:** http**scopes:** `charges.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/marketplace/billing/charges' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

ParametersShow optional parameters

meterId — query

eventId — query

userId — query

startDate — query

endDate — query

skip — query

limit — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
