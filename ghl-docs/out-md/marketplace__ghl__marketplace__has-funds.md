# https://marketplace.gohighlevel.com/docs/ghl/marketplace/has-funds

# Check if account has sufficient funds

GET 

## https://services.leadconnectorhq.com/marketplace/billing/charges/has-funds

Check if account has sufficient funds

### Requirements

#### Scope(s)

`charges.readonly`

#### Auth Method(s)

`OAuth Access Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

## Responses[​](#responses "Direct link to Responses")

*   200
*   422

Returns fund availability status

*   application/json

*   Schema
*   Example (auto)

**Schema**

**hasFunds** boolean

Example:`true`

```
{  "hasFunds": true}
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
curl -L 'https://services.leadconnectorhq.com/marketplace/billing/charges/has-funds' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
