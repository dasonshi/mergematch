# https://marketplace.gohighlevel.com/docs/ghl/opportunities/search-opportunities-advanced

# Search Opportunities

POST 

## https://services.leadconnectorhq.com/opportunities/search

Search opportunities based on combinations of advanced filters. Documentation Link - [https://doc.clickup.com/8631005/d/h/87cpx-424216/7bf11bc9b94f80f](https://doc.clickup.com/8631005/d/h/87cpx-424216/7bf11bc9b94f80f)

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

*   application/json

### Body**required**

**locationId** stringrequired

Location Id

Example:`i2SpAtBVHSVea1sL6oah`

**query** stringrequired

**limit** numberrequired

**page** numberrequired

**searchAfter** string\[\]required

**additionalDetails** objectrequired

**notes** numberrequired

**tasks** numberrequired

**calendarEvents** numberrequired

**unReadConversations** booleanrequired

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**opportunities** object\[\]

*   Array \[
    

**id** string

Example:`yWQobCRIhRguQtD2llvk`

**name** string

Example:`testing`

**monetaryValue** number

Example:`500`

**pipelineId** string

Example:`VDm7RPYC2GLUvdpKmBfC`

**pipelineStageId** string

Example:`e93ba61a-53b3-45e7-985a-c7732dbcdb69`

**assignedTo** string

Example:`zT46WSCPbudrq4zhWMk6`

**status** string

Example:`open`

**source** string

Example:

**lastStatusChangeAt** string

Example:`2021-08-03T04:55:17.355Z`

**lastStageChangeAt** string

Example:`2021-08-03T04:55:17.355Z`

**lastActionDate** string

Example:`2021-08-03T04:55:17.355Z`

**indexVersion** string

Example:`1`

**createdAt** string

Example:`2021-08-03T04:55:17.355Z`

**updatedAt** string

Example:`2021-08-03T04:55:17.355Z`

**contactId** string

Example:`zT46WSCPbudrq4zhWMk6`

**locationId** string

Example:`zT46WSCPbudrq4zhW`

**contact** object

**id** string

Example:`byMEV0NQinDhq8ZfiOi2`

**name** string

Example:`John Deo`

**companyName** string

Example:`Tesla Inc`

**email** string

Example:`john@deo.com`

**phone** string

Example:`+1202-555-0107`

**tags** string\[\]

**notes** string\[\]

**tasks** string\[\]

**calendarEvents** string\[\]

**customFields** object\[\]

*   Array \[
    

**id** stringrequired

Example:`MgobCB14YMVKuE4Ka8p1`

**fieldValue** objectrequired

The value of the custom field

oneOf

*   MOD1
*   MOD2
*   MOD3
*   MOD4

string

object

*   Array \[
    

string

*   \]
    

*   Array \[
    

object

*   \]
    

*   \]
    

**followers** array\[\]

*   \]
    

**meta** object

**total** number

Example:`1`

**nextPageUrl** string

Example:`http://localhost:5066/opportunities/search?q=&location_id=ve9EPM428h8vShlRW1KT&pipeline_id=&pipeline_stage_id=&status=&assigned_to+=&campaignId=&id=&order=&endDate=&startAfter=1625203104328&startAfterId=yWQobCRIhRguQtD2llvk&date=&limit=1&country=&page=1`

**startAfterId** string

Example:`yWQobCRIhRguQtD2llvk`

**startAfter** number

Example:`1625203104328`

**currentPage** number

Example:`2`

**nextPage** number

Example:`3`

**prevPage** number

Example:`1`

**aggregations** object

```
{  "opportunities": [    {      "id": "yWQobCRIhRguQtD2llvk",      "name": "testing",      "monetaryValue": 500,      "pipelineId": "VDm7RPYC2GLUvdpKmBfC",      "pipelineStageId": "e93ba61a-53b3-45e7-985a-c7732dbcdb69",      "assignedTo": "zT46WSCPbudrq4zhWMk6",      "status": "open",      "source": "",      "lastStatusChangeAt": "2021-08-03T04:55:17.355Z",      "lastStageChangeAt": "2021-08-03T04:55:17.355Z",      "lastActionDate": "2021-08-03T04:55:17.355Z",      "indexVersion": 1,      "createdAt": "2021-08-03T04:55:17.355Z",      "updatedAt": "2021-08-03T04:55:17.355Z",      "contactId": "zT46WSCPbudrq4zhWMk6",      "locationId": "zT46WSCPbudrq4zhW",      "contact": {        "id": "byMEV0NQinDhq8ZfiOi2",        "name": "John Deo",        "companyName": "Tesla Inc",        "email": "john@deo.com",        "phone": "+1202-555-0107",        "tags": [          "string"        ]      },      "notes": [        "string"      ],      "tasks": [        "string"      ],      "calendarEvents": [        "string"      ],      "customFields": [        {          "id": "MgobCB14YMVKuE4Ka8p1",          "fieldValue": "string"        }      ],      "followers": [        [          null        ]      ]    }  ],  "meta": {    "total": 1,    "nextPageUrl": "http://localhost:5066/opportunities/search?q=&location_id=ve9EPM428h8vShlRW1KT&pipeline_id=&pipeline_stage_id=&status=&assigned_to+=&campaignId=&id=&order=&endDate=&startAfter=1625203104328&startAfterId=yWQobCRIhRguQtD2llvk&date=&limit=1&country=&page=1",    "startAfterId": "yWQobCRIhRguQtD2llvk",    "startAfter": 1625203104328,    "currentPage": 2,    "nextPage": 3,    "prevPage": 1  },  "aggregations": {}}
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

**name:** [Authorization](/docs/ghl/opportunities/opportunities-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/opportunities/search' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationId": "i2SpAtBVHSVea1sL6oah",  "query": "string",  "limit": 0,  "page": 0,  "searchAfter": [    "string"  ],  "additionalDetails": {    "notes": 0,    "tasks": 0,    "calendarEvents": 0,    "unReadConversations": true  }}'
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

\---2021-07-28

Body required

{
  "locationId": "i2SpAtBVHSVea1sL6oah",  "query": "string",  "limit": 0,  "page": 0,  "searchAfter": \[    "string"  \],  "additionalDetails": {    "notes": 0,    "tasks": 0,    "calendarEvents": 0,    "unReadConversations": true  }
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
