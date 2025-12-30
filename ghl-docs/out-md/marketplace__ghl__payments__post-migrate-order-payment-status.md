# https://marketplace.gohighlevel.com/docs/ghl/payments/post-migrate-order-payment-status

# migration Endpoint for Order Payment Status

POST 

## https://services.leadconnectorhq.com/payments/orders/migrate-order-ps

Process to migrate all the older orders and based on the statuses introduce the payment statuses as well

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Query Parameters

**locationId** string

LocationId is the id of the sub-account.

Example: 3SwdhCu3svxI8AKsPJt6

**altId** stringrequired

AltId is the unique identifier e.g: location id.

Example: 3SwdhCu3svxI8AKsPJt6

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401

Bad Request

*   application/json

*   Schema
*   Example (auto)

**Schema**

**statusCode** number

Example:`400`

**message** string

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

Example:`401`

**message** string

Example:`Invalid token: access token is invalid`

**error** string

Example:`Unauthorized`

```
{  "statusCode": 401,  "message": "Invalid token: access token is invalid",  "error": "Unauthorized"}
```

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/payments/payments-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X POST 'https://services.leadconnectorhq.com/payments/orders/migrate-order-ps' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

altId — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

locationId — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
