# https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/create

# Create a new FAQ inside knowledge base

POST 

## https://services.leadconnectorhq.com/knowledge-bases/faqs

Create a new FAQ inside knowledge base

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

location ID as string

Example:`HqDZpF8GH3qvgJTmKCoL`

**question** stringrequired

faq question as a string

Example:`What is the capital of France?`

**answer** stringrequired

faq answer as a string

Example:`The capital of France is Paris.`

**knowledgeBaseId** stringrequired

knowledge base ID as string

Example:`710KoEzy793Fxubft0bc`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   422
*   500

FAQ created successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**success** booleanrequired

Success status of the operation

Example:`true`

**faq** object

Created FAQ details

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

```
{  "success": true,  "faq": {    "id": "3rzeElC1FOVY91veVBkp",    "question": "What is 1+2?",    "questionLowerCase": "what is 1+2?",    "answer": "3",    "knowledgeBaseId": "I1rITlYLJofFosIqC4Np",    "locationId": "qIyivCmsuEOSnyoFYEej",    "trainedUrlId": "688e6b6d8a1887e6d94d1475",    "deleted": false,    "createdAt": "2025-08-02T19:47:57.243Z",    "updatedAt": "2025-08-02T19:47:57.243Z"  }}
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
curl -L 'https://services.leadconnectorhq.com/knowledge-bases/faqs' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationId": "HqDZpF8GH3qvgJTmKCoL",  "question": "What is the capital of France?",  "answer": "The capital of France is Paris.",  "knowledgeBaseId": "710KoEzy793Fxubft0bc"}'
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
  "locationId": "HqDZpF8GH3qvgJTmKCoL",  "question": "What is the capital of France?",  "answer": "The capital of France is Paris.",  "knowledgeBaseId": "710KoEzy793Fxubft0bc"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
