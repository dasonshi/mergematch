# https://marketplace.gohighlevel.com/docs/ghl/saas/get-saas-plan-deprecated

# Get SaaS Plan

GET 

## https://services.leadconnectorhq.com/saas-api/public-api/saas-plan/:planId

deprecated

This endpoint has been deprecated and may be replaced or removed in future versions of the API.

Fetch a specific SaaS plan by plan ID

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

**planId** stringrequired

Plan ID to get SaaS plan details for

Example: 66c4d36534f21f900dc2a265

### Query Parameters

**companyId** stringrequired

Company ID to filter SaaS plan

Example: 5DP4iH6HLkQsiKESj6rh

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   404
*   500

SaaS plan retrieved successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**planId** stringrequired

Unique identifier for the SaaS plan

Example:`66c4d36534f21f900dc2a265`

**companyId** stringrequired

Company ID associated with the SaaS plan

Example:`66c4d36534f21f900dc2a265`

**title** stringrequired

Title of the SaaS plan

Example:`AED 1.5 changed`

**description** stringrequired

Description of the SaaS plan

Example:`AED 1.5`

**saasProducts** string\[\]required

Array of SaaS products included in the plan

Example:`["2-way-text-messaging","gmb-messaging","web-chat"]`

**addOns** string\[\]

Array of add-ons included in the plan

Example:`["YEXT_V2","WHATSAPP_V1","WORDPRESS_V1","AI_EMPLOYEE","Ad_Publishing_Connect_Your_BM"]`

**planLevel** numberrequired

Level of the plan (0-4)

Example:`0`

**trialPeriod** numberrequired

Trial period in days

Example:`16`

**setupFee** number

Setup fee for the plan

Example:`100`

**userLimit** number

User limit for the plan

Example:`50`

**contactLimit** number

Contact limit for the plan

Example:`50`

**prices** object\[\]required

Prices for the plan

*   Array \[
    

**id** string

Example:`66a9edbfcc6c505a22db7976`

**billingInterval** string

**Possible values:** \[`month`, `year`\]

Example:`month`

**active** boolean

Example:`true`

**amount** number

Example:`150`

**currency** string

Example:`AED`

**symbol** string

Example:`$`

*   \]
    

**categoryId** string

Category ID for the plan

Example:`66911cdc98508ec2731979b9`

**snapshotId** string

Snapshot ID for the plan

Example:`G8KmpIeLnZc7ZMoJoxDx`

**providerLocationId** string

Provider location ID

Example:`r06mdj4OrrERzYDvsOdh`

**productId** string

Product ID for the plan

Example:`66a9edbfcc6c5090bedb7974`

**isSaaSV2** booleanrequired

Indicates if this is a SaaS V2 plan

Example:`true`

**createdAt** date-timerequired

Creation timestamp

Example:`2024-07-31T07:54:41.885Z`

**updatedAt** date-timerequired

Last update timestamp

Example:`2025-04-01T12:27:29.167Z`

```
{  "planId": "66c4d36534f21f900dc2a265",  "companyId": "66c4d36534f21f900dc2a265",  "title": "AED 1.5 changed",  "description": "AED 1.5",  "saasProducts": [    "2-way-text-messaging",    "gmb-messaging",    "web-chat"  ],  "addOns": [    "YEXT_V2",    "WHATSAPP_V1",    "WORDPRESS_V1",    "AI_EMPLOYEE",    "Ad_Publishing_Connect_Your_BM"  ],  "planLevel": 0,  "trialPeriod": 16,  "setupFee": 100,  "userLimit": 50,  "contactLimit": 50,  "prices": [    {      "id": "66a9edbfcc6c505a22db7976",      "billingInterval": "month",      "active": true,      "amount": 150,      "currency": "AED",      "symbol": "$"    }  ],  "categoryId": "66911cdc98508ec2731979b9",  "snapshotId": "G8KmpIeLnZc7ZMoJoxDx",  "providerLocationId": "r06mdj4OrrERzYDvsOdh",  "productId": "66a9edbfcc6c5090bedb7974",  "isSaaSV2": true,  "createdAt": "2024-07-31T07:54:41.885Z",  "updatedAt": "2025-04-01T12:27:29.167Z"}
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
curl -L 'https://services.leadconnectorhq.com/saas-api/public-api/saas-plan/:planId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

planId — pathrequired

companyId — queryrequired

Version — headerrequired

\---2021-04-15

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
