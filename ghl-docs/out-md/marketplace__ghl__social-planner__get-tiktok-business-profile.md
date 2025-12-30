# https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-tiktok-business-profile

# Get Tiktok Business profile

GET 

## https://services.leadconnectorhq.com/social-media-posting/oauth/:locationId/tiktok-business/accounts/:accountId

Get Tiktok Business profile

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

Account Location Id

Example: w37swmmLbA02zgqKPpxITe2

**accountId** stringrequired

Account Id

Example: w37swmmLbA02zgqKPpxITe

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

Example:`201`

**message** stringrequired

Message

Example:`Fetched Tiktok Business Account`

**results** object

Requested Results

**profile** object\[\]

Tiktok Profile

*   Array \[
    

**id** string

Id

Example:`w37swmmLbA02zgqKPpxITe`

**name** string

Name of account

Example:`Account Name`

**username** string

Username of account

Example:`User_name`

**avatar** string

Avatar of profile account

Example:`w37swmmLbA02zgqKPpxITe`

**verified** boolean

Is verified

Example:`true`

**isConnected** boolean

Is connected

Example:`true`

**type** object

Tiktok Account Type must be one of the following values: business, profile

Example:`BUSINESS`

*   \]
    

```
{  "success": true,  "statusCode": 201,  "message": "Fetched Tiktok Business Account",  "results": {    "profile": [      {        "id": "w37swmmLbA02zgqKPpxITe",        "name": "Account Name",        "username": "User_name",        "avatar": "w37swmmLbA02zgqKPpxITe",        "verified": true,        "isConnected": true,        "type": "BUSINESS"      }    ]  }}
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
curl -L 'https://services.leadconnectorhq.com/social-media-posting/oauth/:locationId/tiktok-business/accounts/:accountId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — pathrequired

accountId — pathrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
