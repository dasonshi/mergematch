# https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-linkedin-page-profile

# Get Linkedin pages and profile

GET 

## https://services.leadconnectorhq.com/social-media-posting/oauth/:locationId/linkedin/accounts/:accountId

Get Linkedin pages and profile

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

Example:`200`

**message** stringrequired

Message

Example:`Fetched LinkedIn Account`

**results** object

Requested Results

**pages** object\[\]

LinkedIn Pages

*   Array \[
    

**id** string

Page ID

Example:`w37swmmLbA02zgqKPpxITe`

**name** string

LinkedIn Page Name

Example:`Sample Name`

**avatar** string

Profile Avatar url

Example:`w37swmmLbA02zgqKPpxITe`

**urn** string

URN

**isConnected** boolean

is connected to app

Example:`true`

*   \]
    

**profile** object\[\]

LinkedIn Profile Details

*   Array \[
    

**id** string

Id

Example:`w37swmmLbA02zgqKPpxITe`

**name** string

Name of profile

Example:`Profile Name`

**avatar** string

Profile avatar

Example:`w37swmmLbA02zgqKPpxITe`

**urn** string

URN

**isConnected** boolean

is connected to app

Example:`true`

*   \]
    

```
{  "success": true,  "statusCode": 200,  "message": "Fetched LinkedIn Account",  "results": {    "pages": [      {        "id": "w37swmmLbA02zgqKPpxITe",        "name": "Sample Name",        "avatar": "w37swmmLbA02zgqKPpxITe",        "urn": "string",        "isConnected": true      }    ],    "profile": [      {        "id": "w37swmmLbA02zgqKPpxITe",        "name": "Profile Name",        "avatar": "w37swmmLbA02zgqKPpxITe",        "urn": "string",        "isConnected": true      }    ]  }}
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
curl -L 'https://services.leadconnectorhq.com/social-media-posting/oauth/:locationId/linkedin/accounts/:accountId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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
