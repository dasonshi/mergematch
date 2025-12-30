# https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/get-knowledge-base-by-id

# Get knowledge base by ID

GET 

## https://services.leadconnectorhq.com/knowledge-bases/:knowledgeBaseId

Get knowledge base by ID

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

### Path Parameters

**knowledgeBaseId** stringrequired

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Knowledge base by ID retrieved successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**success** booleanrequired

Success status of the operation

Example:`true`

**data** object

Knowledge base details

**id** stringrequired

Knowledge base ID

Example:`Arc9QRauPKkSuMJO8D0m`

**name** stringrequired

Knowledge base name

Example:`KB for Bot Training`

**nameLowerCase** stringrequired

Knowledge base name in lowercase

Example:`kb for bot training`

**locationId** stringrequired

Location ID

Example:`qIyivCmsuEOSnyoFYEej`

**deleted** booleanrequired

Whether the knowledge base is deleted

Example:`false`

**createdAt** stringrequired

Date when knowledge base was created

Example:`2025-08-01T07:50:41.244Z`

**updatedAt** stringrequired

Date when knowledge base was last updated

Example:`2025-08-01T10:05:58.694Z`

**kbMetadata** objectrequired

Knowledge base metadata with content counts

**faqs** numberrequired

Number of FAQs in the knowledge base

Example:`2`

**urls** numberrequired

Number of URLs in the knowledge base

Example:`64`

**richText** numberrequired

Number of rich text documents in the knowledge base

Example:`0`

**files** numberrequired

Number of files in the knowledge base

Example:`0`

**webSearches** numberrequired

Number of web searche configs in the knowledge base

Example:`0`

**tables** numberrequired

Number of tables in the knowledge base

Example:`0`

**isDefault** boolean

Whether the knowledge base is default or not

Example:`false`

```
{  "success": true,  "data": {    "id": "Arc9QRauPKkSuMJO8D0m",    "name": "KB for Bot Training",    "nameLowerCase": "kb for bot training",    "locationId": "qIyivCmsuEOSnyoFYEej",    "deleted": false,    "createdAt": "2025-08-01T07:50:41.244Z",    "updatedAt": "2025-08-01T10:05:58.694Z",    "kbMetadata": {      "faqs": 2,      "urls": 64,      "richText": 0,      "files": 0,      "webSearches": 0,      "tables": 0    },    "isDefault": false  }}
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
curl -L 'https://services.leadconnectorhq.com/knowledge-bases/:knowledgeBaseId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

knowledgeBaseId — pathrequired

Authorization — headerrequired

Version — headerrequired

\---2021-04-15

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
