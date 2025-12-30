# https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/get-all-website-urls-data-by-knowledge-base

# Get all trained page links by knowledge base

GET 

## https://services.leadconnectorhq.com/knowledge-bases/crawler

Get all trained page links by knowledge base

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

### Query Parameters

**knowledgeBaseId** stringrequired

knowledge base ID as string

Example: tDtDnQdgm2LXpyiqYvZ6

**locationId** stringrequired

location ID as string

Example: tDtDnQdgm2LXpyiqYvZ6

**page** number

Page number

Example: 1

**pageLength** number

Records per page

Example: 1

**query** string

query to filter on url links

Example: www.example.com/

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   422
*   500

Trained page links retrieved successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**count** numberrequired

Total count of URLs in the knowledge base

Example:`64`

**urls** object\[\]required

Array of crawled URLs with their details

*   Array \[
    

**id** stringrequired

Unique identifier for the URL

Example:`688c73a25275c513f5f3a7de`

**url** stringrequired

The actual URL that was crawled

Example:`https://developer.mozilla.org/en-US/blog`

**title** stringrequired

Title of the webpage

Example:`MDN Blog`

**status** stringrequired

Current processing status of the URL

**Possible values:** \[`Pending`, `Processing`, `Successful`, `Failed`, `Existing`, `Restricted`, `Cancelled`, `Aborted`, `Training`\]

Example:`Successful`

**locationId** stringrequired

Location ID associated with this URL

Example:`qIyivCmsuEOSnyoFYEej`

**knowledgeBaseId** stringrequired

Knowledge base ID this URL belongs to

Example:`Arc9QRauPKkSuMJO8D0m`

**content** stringrequired

URL to the stored content file

Example:`https://storage.googleapis.com/crm-conversations-ai-staging/conversationAI/2025/8/1/locations/qIyivCmsuEOSnyoFYEej/688c739c88c89f21ad30f63e-4IseusbZ3vDXMT8WNw9M.txt`

**contentEditedByUser** booleanrequired

Whether the content was edited by user

Example:`false`

**updatedAt** stringrequired

Last updated timestamp

Example:`2025-08-01T07:58:29.858Z`

*   \]
    

```
{  "count": 64,  "urls": [    {      "id": "688c73a25275c513f5f3a7de",      "url": "https://developer.mozilla.org/en-US/blog",      "title": "MDN Blog",      "status": "Successful",      "locationId": "qIyivCmsuEOSnyoFYEej",      "knowledgeBaseId": "Arc9QRauPKkSuMJO8D0m",      "content": "https://storage.googleapis.com/crm-conversations-ai-staging/conversationAI/2025/8/1/locations/qIyivCmsuEOSnyoFYEej/688c739c88c89f21ad30f63e-4IseusbZ3vDXMT8WNw9M.txt",      "contentEditedByUser": false,      "updatedAt": "2025-08-01T07:58:29.858Z"    }  ]}
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

Internal Server Error

*   application/json

*   Schema
*   Example (auto)

**Schema**

**statusCode** number

Example:`500`

**message** string

Example:`Internal Server Error`

```
{  "statusCode": 500,  "message": "Internal Server Error"}
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
curl -L 'https://services.leadconnectorhq.com/knowledge-bases/crawler' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

knowledgeBaseId — queryrequired

locationId — queryrequired

Authorization — headerrequired

Version — headerrequired

\---2021-04-15

Show optional parameters

page — query

pageLength — query

query — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
