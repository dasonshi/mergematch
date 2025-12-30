# https://marketplace.gohighlevel.com/docs/ghl/opportunities/create-opportunity

# Create Opportunity

POST 

## https://services.leadconnectorhq.com/opportunities/

Create Opportunity

### Requirements

#### Scope(s)

`opportunities.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

*   application/json

### Body**required**

**pipelineId** stringrequired

pipeline Id

Example:`VDm7RPYC2GLUvdpKmBfC`

**locationId** stringrequired

Example:`ve9EPM428h8vShlRW1KT`

**name** stringrequired

Example:`First Opps`

**pipelineStageId** string

Example:`7915dedc-8f18-44d5-8bc3-77c04e994a10`

**status** stringrequired

**Possible values:** \[`open`, `won`, `lost`, `abandoned`, `all`\]

**contactId** stringrequired

Example:`mTkSCb1UBjb5tk4OvB69`

**monetaryValue** number

Example:`220`

**assignedTo** string

Example:`082goXVW3lIExEQPOnd3`

**customFields** object\[\]

Add custom fields to opportunities.

*   Array \[
    
anyOf

*   customFieldsInputStringSchema
*   customFieldsInputArraySchema
*   customFieldsInputObjectSchema

**id** string

Pass either `id` or `key` of custom field

Example:`6dvNaf7VhkQ9snc5vnjJ`

**key** string

Pass either `id` or `key` of custom field

Example:`my_custom_field`

**field\_value** string

Example:`9039160788`

**id** stringrequired

Example:`6dvNaf7VhkQ9snc5vnjJ`

**key** string

Example:`my_custom_field`

**field\_value** string\[\]

Example:`["test","test2"]`

**id** stringrequired

Example:`6dvNaf7VhkQ9snc5vnjJ`

**key** string

Example:`my_custom_field`

**field\_value** object

Example:`{}`

*   \]
    

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   422

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**opportunity** object

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

```
{  "opportunity": {    "id": "yWQobCRIhRguQtD2llvk",    "name": "testing",    "monetaryValue": 500,    "pipelineId": "VDm7RPYC2GLUvdpKmBfC",    "pipelineStageId": "e93ba61a-53b3-45e7-985a-c7732dbcdb69",    "assignedTo": "zT46WSCPbudrq4zhWMk6",    "status": "open",    "source": "",    "lastStatusChangeAt": "2021-08-03T04:55:17.355Z",    "lastStageChangeAt": "2021-08-03T04:55:17.355Z",    "lastActionDate": "2021-08-03T04:55:17.355Z",    "indexVersion": 1,    "createdAt": "2021-08-03T04:55:17.355Z",    "updatedAt": "2021-08-03T04:55:17.355Z",    "contactId": "zT46WSCPbudrq4zhWMk6",    "locationId": "zT46WSCPbudrq4zhW",    "contact": {      "id": "byMEV0NQinDhq8ZfiOi2",      "name": "John Deo",      "companyName": "Tesla Inc",      "email": "john@deo.com",      "phone": "+1202-555-0107",      "tags": [        "string"      ]    },    "notes": [      "string"    ],    "tasks": [      "string"    ],    "calendarEvents": [      "string"    ],    "customFields": [      {        "id": "MgobCB14YMVKuE4Ka8p1",        "fieldValue": "string"      }    ],    "followers": [      [        null      ]    ]  }}
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

**name:** [Authorization](/docs/ghl/opportunities/opportunities-api#authentication)**type:** http**scopes:** `opportunities.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/opportunities/' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "pipelineId": "VDm7RPYC2GLUvdpKmBfC",  "locationId": "ve9EPM428h8vShlRW1KT",  "name": "First Opps",  "pipelineStageId": "7915dedc-8f18-44d5-8bc3-77c04e994a10",  "status": "open",  "contactId": "mTkSCb1UBjb5tk4OvB69",  "monetaryValue": 220,  "assignedTo": "082goXVW3lIExEQPOnd3",  "customFields": [    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my_custom_field",      "field_value": "9039160788"    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my_custom_field",      "field_value": [        "test",        "test2"      ]    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my_custom_field",      "field_value": {}    }  ]}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

Version — headerrequired

\---2021-07-28

Body required

{
  "pipelineId": "VDm7RPYC2GLUvdpKmBfC",  "locationId": "ve9EPM428h8vShlRW1KT",  "name": "First Opps",  "pipelineStageId": "7915dedc-8f18-44d5-8bc3-77c04e994a10",  "status": "open",  "contactId": "mTkSCb1UBjb5tk4OvB69",  "monetaryValue": 220,  "assignedTo": "082goXVW3lIExEQPOnd3",  "customFields": \[    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my\_custom\_field",      "field\_value": "9039160788"    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my\_custom\_field",      "field\_value": \[        "test",        "test2"      \]    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my\_custom\_field",      "field\_value": {}    }  \]
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
