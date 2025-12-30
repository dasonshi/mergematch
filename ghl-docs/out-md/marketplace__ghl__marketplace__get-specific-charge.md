# https://marketplace.gohighlevel.com/docs/ghl/marketplace/get-specific-charge

# Get specific wallet charge details

GET 

## https://services.leadconnectorhq.com/marketplace/billing/charges/:chargeId

Get specific wallet charge details

### Requirements

#### Scope(s)

`charges.readonly`

#### Auth Method(s)

`OAuth Access Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Path Parameters

**chargeId** stringrequired

ID of the charge to retrieve

## Responses[​](#responses "Direct link to Responses")

*   200
*   404
*   422

Returns charge details

*   application/json

*   Schema
*   Example (auto)

**Schema**

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

```
{  "refunded": true,  "currency": "string",  "appId": "string",  "meterId": "string",  "chargeId": "string",  "entityType": "string",  "entityId": "string",  "amountCharged": 0,  "pricePerUnit": 0,  "transactionType": "string",  "units": 0,  "meta": {},  "createdAt": "2024-07-29T15:51:28.071Z",  "updatedAt": "2024-07-29T15:51:28.071Z"}
```

Charge not found

*   application/json

*   Schema
*   Example (auto)

**Schema**

**message** string

Example:`Charge not found`

**statusCode** number

Example:`404`

```
{  "message": "Charge not found",  "statusCode": 404}
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
curl -L 'https://services.leadconnectorhq.com/marketplace/billing/charges/:chargeId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

chargeId — pathrequired

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
