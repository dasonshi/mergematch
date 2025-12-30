# https://marketplace.gohighlevel.com/docs/ghl/social-planner/delete-csv

# Delete CSV

DELETE 

## https://services.leadconnectorhq.com/social-media-posting/:locationId/csv/:id

Delete CSV

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

### Path Parameters

**locationId** stringrequired

Example: sdfdsfdsfEWEsdfsdsW32dd

**id** stringrequired

CSV Id

Example: 65f92e55cc884f0d0845e447

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

**success** booleanrequired

Success or Failure

Example:`true`

**statusCode** numberrequired

Status Code

Example:`200`

**message** stringrequired

Message

Example:`Deleted Post`

**results** object

Requested Results

**csv** object

CSV Data

**locationId** string

Example:`Location Name`

**fileName** string

Example:`File Name`

**accountIds** string\[\]

Account Ids

Example:`["aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"]`

**file** string

Example:`File`

**status** object

status must be one of the following values: pending, in\_progress, completed, failed, in\_review, importing, deleted

Example:`completed`

**count** number

Example:`5`

**createdBy** string

Example:`AccountId_SDsdfdf45Dgs4w3ssss`

**traceId** string

Example:`FSeSDsdfdf45Dgs4w3ssss`

**originId** string

Example:`FSeSDsdfdf45Dgs4w3ssss`

**approver** string

Example:`FSeSDsdfdf45Dgs4w3ssss`

```
{  "success": true,  "statusCode": 200,  "message": "Deleted Post",  "results": {    "csv": {      "locationId": "Location Name",      "fileName": "File Name",      "accountIds": [        "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"      ],      "file": "File",      "status": "completed",      "count": 5,      "createdBy": "AccountId_SDsdfdf45Dgs4w3ssss",      "traceId": "FSeSDsdfdf45Dgs4w3ssss",      "originId": "FSeSDsdfdf45Dgs4w3ssss",      "approver": "FSeSDsdfdf45Dgs4w3ssss"    }  }}
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

**name:** [Authorization](/docs/ghl/social-planner/social-media-posting-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X DELETE 'https://services.leadconnectorhq.com/social-media-posting/:locationId/csv/:id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — pathrequired

id — pathrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
