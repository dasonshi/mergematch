# https://marketplace.gohighlevel.com/docs/ghl/knowledge-base/get-crawling-status-for-latest-operation

# Get crawling status for the latest operation

GET 

## https://services.leadconnectorhq.com/knowledge-bases/crawler/status

Get crawling status for the latest operation

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

**locationId** stringrequired

Location ID as string

Example: tDtDnQdgm2LXpyiqYvZ6

**operationId** stringrequired

operation id as string

Example: 1

**knowledgeBaseId** stringrequired

knowledge base id

Example: jjkkxftgvbhjmn,

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   422
*   500

Operation status fetched successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**success** booleanrequired

Indicates if the operation was successful

Example:`true`

**data** object

Detailed crawling status data

**aggregate** object\[\]required

Aggregated crawling results by status

*   Array \[
    

**\_id** stringrequired

Status grouping identifier

**Possible values:** \[`Pending`, `Processing`, `Successful`, `Failed`, `Existing`, `Restricted`, `Cancelled`, `Aborted`, `Training`\]

Example:`Failed`

**records** object\[\]required

Array of records for this status

*   Array \[
    

**url** stringrequired

URL being crawled

Example:`https://developer.mozilla.org/en-US/blog/rss.xml`

**id** stringrequired

Unique record identifier

Example:`688e41118a188704914d13c0`

**title** string

Page title (for successful/pending records)

Example:`JavaScript Temporal is coming | MDN Blog`

**error** object

Error details (for failed records)

**stack** stringrequired

Error stack trace

Example:`HttpException: Failed to fetch HTML content at getHtml (/app/dist/apps/conversations-ai/crm-conversations-ai-discover-worker.js:2531:15)`

**response** stringrequired

Error response message

Example:`Failed to fetch HTML content`

**status** numberrequired

HTTP status code

Example:`500`

**options** object

Additional options (nullable)

Example:`null`

**message** stringrequired

Error message

Example:`Failed to fetch HTML content`

**name** stringrequired

Error name/type

Example:`HttpException`

*   \]
    

*   \]
    

**operationDetails** objectrequired

Detailed operation information

**discoveredUrlsCount** numberrequired

Number of URLs discovered

Example:`66`

**trainedUrlsCount** numberrequired

Number of URLs successfully trained

Example:`0`

**\_id** stringrequired

Operation unique identifier

Example:`688e410c8a18870ecf4d13bb`

**locationId** stringrequired

Associated location ID

Example:`nnAzVJqSv6PJ1p6zrhvC`

**status** stringrequired

Current operation status

**Possible values:** \[`Pending`, `Processing`, `Successful`, `Failed`, `Existing`, `Restricted`, `Cancelled`, `Aborted`, `Training`\]

Example:`Pending`

**url** stringrequired

Base URL being crawled

Example:`https://developer.mozilla.org/en-US/blog/`

**mode** stringrequired

Crawling mode used

**Possible values:** \[`Exact`, `Path`, `Domain`\]

Example:`Path`

**knowledgeBaseId** stringrequired

Knowledge base ID

Example:`CCNPhKqSCkTOG8O7dtbq`

**createdAt** stringrequired

Operation creation timestamp

Example:`2025-08-02T16:47:08.182Z`

**updatedAt** stringrequired

Last update timestamp

Example:`2025-08-02T16:48:43.635Z`

**\_\_v** numberrequired

Version field

Example:`0`

**robotsFileData** string

Robots.txt file content

Example:`User-agent: * Sitemap: https://developer.mozilla.org/sitemap.xml Disallow: /api/`

```
{  "success": true,  "data": {    "aggregate": [      {        "_id": "Failed",        "records": [          {            "url": "https://developer.mozilla.org/en-US/blog/rss.xml",            "id": "688e41118a188704914d13c0",            "title": "JavaScript Temporal is coming | MDN Blog",            "error": {              "stack": "HttpException: Failed to fetch HTML content\n    at getHtml (/app/dist/apps/conversations-ai/crm-conversations-ai-discover-worker.js:2531:15)",              "response": "Failed to fetch HTML content",              "status": 500,              "options": null,              "message": "Failed to fetch HTML content",              "name": "HttpException"            }          }        ]      }    ],    "operationDetails": {      "discoveredUrlsCount": 66,      "trainedUrlsCount": 0,      "_id": "688e410c8a18870ecf4d13bb",      "locationId": "nnAzVJqSv6PJ1p6zrhvC",      "status": "Pending",      "url": "https://developer.mozilla.org/en-US/blog/",      "mode": "Path",      "knowledgeBaseId": "CCNPhKqSCkTOG8O7dtbq",      "createdAt": "2025-08-02T16:47:08.182Z",      "updatedAt": "2025-08-02T16:48:43.635Z",      "__v": 0,      "robotsFileData": "User-agent: *\nSitemap: https://developer.mozilla.org/sitemap.xml\nDisallow: /api/"    }  }}
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
curl -L 'https://services.leadconnectorhq.com/knowledge-bases/crawler/status' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — queryrequired

operationId — queryrequired

knowledgeBaseId — queryrequired

Authorization — headerrequired

Version — headerrequired

\---2021-04-15

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
