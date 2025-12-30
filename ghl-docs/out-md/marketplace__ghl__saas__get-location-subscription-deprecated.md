# https://marketplace.gohighlevel.com/docs/ghl/saas/get-location-subscription-deprecated

# Get Location Subscription Details

GET 

## https://services.leadconnectorhq.com/saas-api/public-api/get-saas-subscription/:locationId

deprecated

This endpoint has been deprecated and may be replaced or removed in future versions of the API.

Fetch subscription details for a specific location from location metadata

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

Location ID to get subscription details for

Example: AUKAtFVo0lWezBsBQ3FE

### Query Parameters

**companyId** stringrequired

Company ID to filter subscription details

Example: 5DP4iH6HLkQsiKESj6rh

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   404
*   500

Location subscription details retrieved successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**locationId** stringrequired

Location ID

Example:`locationId1`

**isSaaSV2** booleanrequired

Indicates if the SaaS is V2

Example:`true`

**companyId** stringrequired

Company ID

Example:`companyId1`

**saasMode** string

SaaS mode

Example:`saasV2`

**subscriptionId** string

Subscription ID

Example:`subscriptionId1`

**customerId** string

Customer ID

Example:`customerId1`

**productId** string

Product ID

Example:`productId1`

**priceId** string

Price ID

Example:`priceId1`

**saasPlanId** string

SaaS plan ID

Example:`saasPlanId1`

**subscriptionStatus** string

Subscription status

Example:`active`

```
{  "locationId": "locationId1",  "isSaaSV2": true,  "companyId": "companyId1",  "saasMode": "saasV2",  "subscriptionId": "subscriptionId1",  "customerId": "customerId1",  "productId": "productId1",  "priceId": "priceId1",  "saasPlanId": "saasPlanId1",  "subscriptionStatus": "active"}
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
curl -L 'https://services.leadconnectorhq.com/saas-api/public-api/get-saas-subscription/:locationId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — pathrequired

companyId — queryrequired

Version — headerrequired

\---2021-04-15

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
