# https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/train-discovered-urls

# Train discovered website pages and ingest into the knowledge base

POST 

## https://services.leadconnectorhq.com/knowledge-bases/crawler/train

Train discovered website pages and ingest into the knowledge base

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

**locationId** stringrequired

Location ID as string

Example:`tDtDnQdgm2LXpyiqYvZ6`

**urlIds** string\[\]required

List of Object ids of the discovered urls

Example:`["688b640bcb02d498102a13ec","688b640bcb02d498102a13ea"]`

**knowledgeBaseId** stringrequired

knowledge base id

Example:`jjkkxftgvbhjmn,`

**operationId** stringrequired

operation id as string

Example:`688b640bcb02d498102a13f0,`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   422
*   500

Pages trained successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**success** booleanrequired

Indicates if the operation was successful

Example:`true`

```
{  "success": true}
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
curl -L 'https://services.leadconnectorhq.com/knowledge-bases/crawler/train' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationId": "tDtDnQdgm2LXpyiqYvZ6",  "urlIds": [    "688b640bcb02d498102a13ec",    "688b640bcb02d498102a13ea"  ],  "knowledgeBaseId": "jjkkxftgvbhjmn,",  "operationId": "688b640bcb02d498102a13f0,"}'
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
  "locationId": "tDtDnQdgm2LXpyiqYvZ6",  "urlIds": \[    "688b640bcb02d498102a13ec",    "688b640bcb02d498102a13ea"  \],  "knowledgeBaseId": "jjkkxftgvbhjmn,",  "operationId": "688b640bcb02d498102a13f0,"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
