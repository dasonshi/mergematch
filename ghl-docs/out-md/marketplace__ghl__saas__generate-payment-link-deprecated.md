# https://marketplace.gohighlevel.com/docs/ghl/saas/generate-payment-link-deprecated

# Update SaaS subscription

PUT 

## https://services.leadconnectorhq.com/saas-api/public-api/update-saas-subscription/:locationId

deprecated

This endpoint has been deprecated and may be replaced or removed in future versions of the API.

Update SaaS subscription for given locationId and customerId

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

**locationId** stringrequired

Location ID to update subscription for

Example: AUKAtFVo0lWezBsBQ3FE

*   application/json

### Body**required**

**subscriptionId** stringrequired

Subscription ID

Example:`sub_1QDPY5FpU9DlKp7RQ8BXfywx`

**customerId** stringrequired

Customer ID

Example:`cus_1QDPY5FpU9DlKp7RQ8BXfywx`

**companyId** stringrequired

Company ID

Example:`companyId1`

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   404
*   500

SaaS subscription updated successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**string** string

```
"string"
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
curl -L -X PUT 'https://services.leadconnectorhq.com/saas-api/public-api/update-saas-subscription/:locationId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "subscriptionId": "sub_1QDPY5FpU9DlKp7RQ8BXfywx",  "customerId": "cus_1QDPY5FpU9DlKp7RQ8BXfywx",  "companyId": "companyId1"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — pathrequired

Version — headerrequired

\---2021-04-15

Body required

{
  "subscriptionId": "sub\_1QDPY5FpU9DlKp7RQ8BXfywx",  "customerId": "cus\_1QDPY5FpU9DlKp7RQ8BXfywx",  "companyId": "companyId1"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
