# https://marketplace.gohighlevel.com/docs/ghl/marketplace/delete-charge

# Delete a wallet charge

DELETE 

## https://services.leadconnectorhq.com/marketplace/billing/charges/:chargeId

Delete a wallet charge

### Requirements

#### Scope(s)

`charges.write`

#### Auth Method(s)

`OAuth Access Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Path Parameters

**chargeId** stringrequired

ID of the charge to delete

## Responses[​](#responses "Direct link to Responses")

*   200
*   404
*   422

Charge deleted successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**success** boolean

Example:`true`

```
{  "success": true}
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
curl -L -X DELETE 'https://services.leadconnectorhq.com/marketplace/billing/charges/:chargeId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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
