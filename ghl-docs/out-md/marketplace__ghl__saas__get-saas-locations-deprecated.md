# https://marketplace.gohighlevel.com/docs/ghl/saas/get-saas-locations-deprecated

# Get SaaS Locations

GET 

## https://services.leadconnectorhq.com/saas-api/public-api/saas-locations/:companyId

deprecated

This endpoint has been deprecated and may be replaced or removed in future versions of the API.

Fetch all SaaS-activated locations for a company with pagination

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

Company ID to get SaaS locations for

Example: 5DP4iH6HLkQsiKESj6rh

### Query Parameters

**page** number

Page number for pagination

Example: 1

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   404
*   500

SaaS locations retrieved successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**locations** object\[\]required

Array of SaaS locations

*   Array \[
    

**locationId** stringrequired

Location ID

Example:`locationId1`

**companyId** stringrequired

Company ID

Example:`companyId1`

**saasMode** stringrequired

SaaS mode

Example:`saasV2`

**subscriptionId** stringrequired

Subscription ID

Example:`subscriptionId1`

**customerId** string

Customer ID

Example:`customerId1`

**name** string

Name

Example:`John Doe`

**email** string

Email

Example:`john.doe@example.com`

**providerLocationId** string

Provider location ID

Example:`r06mdj4OrrERzYDvsOdh`

**isSaaSV2** boolean

Indicates if the SaaS is V2

Example:`true`

**subscriptionInfo** object

Subscription information

Example:`{"priceId":"price_1QDPY5FpU9DlKp7RQ8BXfywx","saasPlanId":"66c4d36534f21f900dc2a265","stripeProductId":"prod_1QDPY5FpU9DlKp7RQ8BXfywx","subscriptionStatus":"active"}`

*   \]
    

**pagination** objectrequired

**page** number

Page number

Example:`1`

**limit** number

Number of items per page

Example:`10`

**total** number

Total number of items

Example:`100`

**totalPages** number

Total number of pages

Example:`10`

**hasNext** boolean

Indicates if there is a next page

Example:`true`

**hasPrev** boolean

Indicates if there is a previous page

Example:`true`

```
{  "locations": [    {      "locationId": "locationId1",      "companyId": "companyId1",      "saasMode": "saasV2",      "subscriptionId": "subscriptionId1",      "customerId": "customerId1",      "name": "John Doe",      "email": "john.doe@example.com",      "providerLocationId": "r06mdj4OrrERzYDvsOdh",      "isSaaSV2": true,      "subscriptionInfo": {        "priceId": "price_1QDPY5FpU9DlKp7RQ8BXfywx",        "saasPlanId": "66c4d36534f21f900dc2a265",        "stripeProductId": "prod_1QDPY5FpU9DlKp7RQ8BXfywx",        "subscriptionStatus": "active"      }    }  ],  "pagination": {    "page": 1,    "limit": 10,    "total": 100,    "totalPages": 10,    "hasNext": true,    "hasPrev": true  }}
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
curl -L 'https://services.leadconnectorhq.com/saas-api/public-api/saas-locations/:companyId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

Show optional parameters

page — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
