# https://marketplace.gohighlevel.com/docs/ghl/locations/task-search

# Task Search Filter

POST 

## https://services.leadconnectorhq.com/locations/:locationId/tasks/search

Task Search

### Requirements

#### Scope(s)

`locations/tasks.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Path Parameters

**locationId** stringrequired

Location Id

Example: ve9EPM428h8vShlRW1KT

*   application/json

### Body**required**

**contactId** string\[\]

Contact Ids

Example:`["dSMo5jnqkJyh8YeGXM7k","j5WESpmRj816VtyUuWwh"]`

**completed** boolean

Task Completed Or Pending

Example:`true`

**assignedTo** string\[\]

Assigned User Ids

Example:`["0004Mtfsd11SBU1mBPgd"]`

**query** string

Search Value

Example:`Task Name`

**limit** number

Limit To Api

**Default value:** `25`

Example:`10`

**skip** number

Number Of Tasks To Skip

**Default value:** `0`

Example:`10`

**businessId** string

Bussiness Id

Example:`6348240b98722079e5417332`

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   422

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**tasks** array\[\]

```
{  "tasks": [    [      null    ]  ]}
```

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

**name:** [Authorization](/docs/ghl/locations/sub-account-formerly-location-api#authentication)**type:** http**scopes:** `locations/tasks.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/locations/:locationId/tasks/search' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "contactId": [    "dSMo5jnqkJyh8YeGXM7k",    "j5WESpmRj816VtyUuWwh"  ],  "completed": true,  "assignedTo": [    "0004Mtfsd11SBU1mBPgd"  ],  "query": "Task Name",  "limit": 10,  "skip": 10,  "businessId": "6348240b98722079e5417332"}'
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

\---2021-07-28

Body required

{
  "contactId": \[    "dSMo5jnqkJyh8YeGXM7k",    "j5WESpmRj816VtyUuWwh"  \],  "completed": true,  "assignedTo": \[    "0004Mtfsd11SBU1mBPgd"  \],  "query": "Task Name",  "limit": 10,  "skip": 10,  "businessId": "6348240b98722079e5417332"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
