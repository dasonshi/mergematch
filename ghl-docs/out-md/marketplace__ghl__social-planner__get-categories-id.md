# https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-categories-id

# Get categories by id

GET 

## https://services.leadconnectorhq.com/social-media-posting/:locationId/categories/:id

Get categories by id

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Authorization** stringrequired

Access Token

Example: Bearer 9c48df2694a849b6089f9d0d3513efe

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Path Parameters

**id** stringrequired

Category Id

Example: 6284c43d519161e96cc09c13

**locationId** stringrequired

Location Id

Example: 6284c43d519161e96cc09c13

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

Example:`Fetched Category`

**results** object

Requested Results

**category** object

Category Schema

**name** string

Category Name

Example:`Primary`

**primaryColor** string

Color For Category

Example:`#32a852`

**secondaryColor** string

Secondary Color

Example:`#32a852`

**locationId** string

Location ID

Example:`Lx1EI6YIgQYMQi0ytFXv`

**\_id** string

ID

Example:`Lx1EI6YIgQYMQi0ytFXv`

**createdBy** string

Created By User

Example:`Lx1EI6YIgQYMQi0ytFXv`

**deleted** booleanrequired

Deleted Value

Example:`false`

**message** string

Message

Example:`Category not found`

**createdAt** date-time

Example:`2023-08-02T00:00:00.000Z`

**updatedAt** date-time

Example:`2023-08-02T00:00:00.000Z`

```
{  "success": true,  "statusCode": 200,  "message": "Fetched Category",  "results": {    "category": {      "name": "Primary",      "primaryColor": "#32a852",      "secondaryColor": "#32a852",      "locationId": "Lx1EI6YIgQYMQi0ytFXv",      "_id": "Lx1EI6YIgQYMQi0ytFXv",      "createdBy": "Lx1EI6YIgQYMQi0ytFXv",      "deleted": false,      "message": "Category not found",      "createdAt": "2023-08-02T00:00:00.000Z",      "updatedAt": "2023-08-02T00:00:00.000Z"    }  }}
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
curl -L 'https://services.leadconnectorhq.com/social-media-posting/:locationId/categories/:id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

id — pathrequired

locationId — pathrequired

Authorization — headerrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
