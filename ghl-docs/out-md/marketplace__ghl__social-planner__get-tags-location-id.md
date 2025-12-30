# https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-tags-location-id

# Get tags by location id

GET 

## https://services.leadconnectorhq.com/social-media-posting/:locationId/tags

Get tags by location id

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

**searchText** string

Search text string

Example: test

**limit** string

Limit

Example: 10

**skip** string

Skip

Example: 0

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

Example:`Fetched Tags by Location ID`

**results** object

Requested Results

**tags** object\[\]

Tags Data

*   Array \[
    

**tag** string

Tag Name

Example:`Primary Tag`

**locationId** string

Location Id

Example:`Lx1EI6YIgQYMQi0ytFXv`

**\_id** string

ID

Example:`Lx1EI6YIgQYMQi0ytFXv`

**createdBy** string

Created By User Id

Example:`Lx1EI6YIgQYMQi0ytFXv`

**deleted** boolean

Deleted boolean value

Example:`false`

**createdAt** date-time

Example:`2023-08-02T00:00:00.000Z`

**updatedAt** date-time

Example:`2023-08-02T00:00:00.000Z`

*   \]
    

**count** number

Count

Example:`3`

```
{  "success": true,  "statusCode": 200,  "message": "Fetched Tags by Location ID",  "results": {    "tags": [      {        "tag": "Primary Tag",        "locationId": "Lx1EI6YIgQYMQi0ytFXv",        "_id": "Lx1EI6YIgQYMQi0ytFXv",        "createdBy": "Lx1EI6YIgQYMQi0ytFXv",        "deleted": false,        "createdAt": "2023-08-02T00:00:00.000Z",        "updatedAt": "2023-08-02T00:00:00.000Z"      }    ],    "count": 3  }}
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
curl -L 'https://services.leadconnectorhq.com/social-media-posting/:locationId/tags' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

searchText — query

limit — query

skip — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
