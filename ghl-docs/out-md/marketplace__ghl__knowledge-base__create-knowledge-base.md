# https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/create-knowledge-base

# Create a new knowledge base (max 15 knowledge bases per location)

POST 

## https://services.leadconnectorhq.com/knowledge-bases/

Create a new knowledge base (max 15 knowledge bases per location)

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

**Possible values:** \[`2021-04-15`\]

API Version

*   application/json

### Body**required**

**name** stringrequired

**description** string

**locationId** stringrequired

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401

Knowledge base created successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**success** booleanrequired

Success status of the operation

Example:`true`

**data** object

Created knowledge base details

**id** stringrequired

Knowledge base ID

Example:`ZwTB8S0yo0FIBY6OPZTD`

**name** stringrequired

Knowledge base name

Example:`KB for Bot Training`

**nameLowerCase** stringrequired

Knowledge base name in lowercase

Example:`kb for bot training`

**locationId** stringrequired

Location ID

Example:`qIyivCmsuEOSnyoFYEej`

**kbMetadata** objectrequired

Knowledge base metadata

Example:`{}`

**deleted** booleanrequired

Whether the knowledge base is deleted

Example:`false`

**createdAt** stringrequired

Date when knowledge base was created

Example:`2025-08-02T20:26:57.057Z`

**updatedAt** stringrequired

Date when knowledge base was last updated

Example:`2025-08-02T20:26:57.057Z`

```
{  "success": true,  "data": {    "id": "ZwTB8S0yo0FIBY6OPZTD",    "name": "KB for Bot Training",    "nameLowerCase": "kb for bot training",    "locationId": "qIyivCmsuEOSnyoFYEej",    "kbMetadata": {},    "deleted": false,    "createdAt": "2025-08-02T20:26:57.057Z",    "updatedAt": "2025-08-02T20:26:57.057Z"  }}
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

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/knowledge-base/knowledge-base-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/knowledge-bases/' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "string",  "description": "string",  "locationId": "string"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

Authorization — headerrequired

Version — headerrequired

\---2021-04-15

Body required

{
  "name": "string",  "description": "string",  "locationId": "string"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
