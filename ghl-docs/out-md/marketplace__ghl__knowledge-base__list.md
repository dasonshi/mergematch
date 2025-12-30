# https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/list

# Get all FAQs by knowledge base with pagination support

GET 

## https://services.leadconnectorhq.com/knowledge-bases/faqs

Retrieves FAQs for a knowledge base. Supports pagination using limit and lastFaqId parameters.

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

Example: 710KoEzy793Fxubft0bc

**locationId** stringrequired

location ID as string

Example: qDZpF8GH3qvgJTmKCoL

**limit** number

Limit the number of FAQs returned

Default value:`10`

Example: 10

**lastFaqId** string

Last FAQ ID for pagination (cursor-based)

Example: 3rzeElC1FOVY91veVBkp

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   422
*   500

FAQs retrieved successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**count** numberrequired

Total count of all FAQs in the knowledge base

Example:`150`

**faqs** object\[\]required

Array of FAQ objects

*   Array \[
    

**id** stringrequired

FAQ ID as string

Example:`3rzeElC1FOVY91veVBkp`

**question** stringrequired

FAQ question

Example:`What is 1+2?`

**questionLowerCase** stringrequired

FAQ question in lowercase

Example:`what is 1+2?`

**answer** stringrequired

FAQ answer

Example:`3`

**knowledgeBaseId** stringrequired

Knowledge base ID

Example:`I1rITlYLJofFosIqC4Np`

**locationId** stringrequired

Location ID

Example:`qIyivCmsuEOSnyoFYEej`

**trainedUrlId** stringrequired

Trained URL ID

Example:`688e6b6d8a1887e6d94d1475`

**deleted** booleanrequired

Whether the FAQ is deleted

Example:`false`

**createdAt** stringrequired

Date when FAQ was created

Example:`2025-08-02T19:47:57.243Z`

**updatedAt** stringrequired

Date when FAQ was last updated

Example:`2025-08-02T19:47:57.243Z`

*   \]
    

**lastFaqId** string

Last FAQ ID for pagination (use as lastFaqId in next request)

Example:`3rzeElC1FOVY91veVBkp`

**hasMore** boolean

Whether there are more FAQs available

Example:`true`

```
{  "count": 150,  "faqs": [    {      "id": "3rzeElC1FOVY91veVBkp",      "question": "What is 1+2?",      "questionLowerCase": "what is 1+2?",      "answer": "3",      "knowledgeBaseId": "I1rITlYLJofFosIqC4Np",      "locationId": "qIyivCmsuEOSnyoFYEej",      "trainedUrlId": "688e6b6d8a1887e6d94d1475",      "deleted": false,      "createdAt": "2025-08-02T19:47:57.243Z",      "updatedAt": "2025-08-02T19:47:57.243Z"    }  ],  "lastFaqId": "3rzeElC1FOVY91veVBkp",  "hasMore": true}
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
curl -L 'https://services.leadconnectorhq.com/knowledge-bases/faqs' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

limit — query

lastFaqId — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
