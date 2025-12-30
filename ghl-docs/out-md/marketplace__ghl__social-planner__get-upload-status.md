# https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-upload-status

# Get Upload Status

GET 

## https://services.leadconnectorhq.com/social-media-posting/:locationId/csv

Get Upload Status

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

Location Id

Example: ve9EPM428h8vShlRW1KT

### Query Parameters

**skip** string

Default value:`0`

Example: 1

**limit** string

Default value:`10`

Example: 10

**includeUsers** string

Example: true

**userId** string

User ID

Example: sdfdsfdsfEWEsdfsdsW32dd

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

Example:`Fetched CSV Upload Status`

**results** object

Requested Results

**csvs** objectrequired

CSV Data

**\_id** stringrequired

Csv Id

Example:`ve9EPM428h8vShlRW1KT`

**locationId** string

locationId

Example:`iVrVJ2uoXNF0wzcBzgl5`

**fileName** string

File Name

Example:`sample.csv`

**accountIds** string\[\]

Account Ids

Example:`["aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"]`

**file** string

File path

Example:`File`

**status** string

status must be one of the following values: pending, in\_progress, completed, failed, in\_review, importing, deleted

Example:`completed`

**count** number

Posts count

Example:`5`

**createdBy** string

Created By Id

Example:`SDsdfdf45Dgs4w3ssss`

**traceId** string

Trace Id

Example:`FSeSDsdfdf45Dgs4w3ssss`

**originId** string

Origin Id

Example:`FSeSDsdfdf45Dgs4w3ssss`

**approver** string

Approver Id

Example:`FSeSDsdfdf45Dgs4w3ssss`

**createdAt** date-time

Date Created

Example:`2023-08-02T00:00:00.000Z`

**count** numberrequired

Example:`6`

```
{  "success": true,  "statusCode": 200,  "message": "Fetched CSV Upload Status",  "results": {    "csvs": {      "_id": "ve9EPM428h8vShlRW1KT",      "locationId": "iVrVJ2uoXNF0wzcBzgl5",      "fileName": "sample.csv",      "accountIds": [        "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"      ],      "file": "File",      "status": "completed",      "count": 5,      "createdBy": "SDsdfdf45Dgs4w3ssss",      "traceId": "FSeSDsdfdf45Dgs4w3ssss",      "originId": "FSeSDsdfdf45Dgs4w3ssss",      "approver": "FSeSDsdfdf45Dgs4w3ssss",      "createdAt": "2023-08-02T00:00:00.000Z"    },    "count": 6  }}
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
curl -L 'https://services.leadconnectorhq.com/social-media-posting/:locationId/csv' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

Show optional parameters

skip — query

limit — query

includeUsers — query

userId — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
