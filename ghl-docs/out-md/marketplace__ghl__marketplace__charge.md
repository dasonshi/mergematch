# https://marketplace.gohighlevel.com/docs/ghl/marketplace/charge

# Create a new wallet charge

POST 

## https://services.leadconnectorhq.com/marketplace/billing/charges

Create a new wallet charge

### Requirements

#### Scope(s)

`charges.write`

#### Auth Method(s)

`OAuth Access Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

*   application/json

### Body**required**

**appId** stringrequired

App ID of the App

**meterId** stringrequired

Billing Meter ID (you can find this on your app's pricing page)

**eventId** stringrequired

Event ID / Transaction ID on your server's side. This will help you maintain the reference of the event/transaction on your end that you charged the customer for.

**userId** string

User ID

**locationId** stringrequired

ID of the Sub-Account to be charged

**companyId** stringrequired

ID of the Agency the Sub-account belongs to

**description** stringrequired

Description of the charge

**price** number

Price per unit to charge

**units** stringrequired

Number of units to charge

**eventTime** string

The timestamp when the event/transaction was performed. If blank, the billing timestamp will be set as the event time. ISO8601 Format.

Example:`2025-03-26T00:00:000Z`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   422

Charge created successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**success** boolean

Example:`true`

**chargeId** string

Example:`charge_123`

```
{  "success": true,  "chargeId": "charge_123"}
```

Bad request

*   application/json

*   Schema
*   Example (auto)

**Schema**

**message** string

**statusCode** number

Example:`400`

```
{  "message": "string",  "statusCode": 400}
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

**name:** [Authorization](/docs/ghl/marketplace/developer-marketplace-api#authentication)**type:** http**scopes:** `charges.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/marketplace/billing/charges' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appId": "string",  "meterId": "string",  "eventId": "string",  "userId": "string",  "locationId": "string",  "companyId": "string",  "description": "string",  "price": 0,  "units": "string",  "eventTime": "2025-03-26T00:00:000Z"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Body required

{
  "appId": "string",  "meterId": "string",  "eventId": "string",  "userId": "string",  "locationId": "string",  "companyId": "string",  "description": "string",  "price": 0,  "units": "string",  "eventTime": "2025-03-26T00:00:000Z"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
