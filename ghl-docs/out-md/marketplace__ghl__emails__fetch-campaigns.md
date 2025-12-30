# https://marketplace.gohighlevel.com/docs/ghl/emails/fetch-campaigns

# Get Campaigns

GET 

## https://services.leadconnectorhq.com/emails/schedule

Get Campaigns

### Requirements

#### Scope(s)

`emails/schedule.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Query Parameters

**locationId** stringrequired

Location ID to fetch campaigns from

Example: ohjiah0wdg3bzmzacvd6

**limit** number

Maximum number of campaigns to return. Defaults to 10, maximum is 100

Example: 7

**offset** number

Number of campaigns to skip for pagination

Example: 0

**status** string

**Possible values:** \[`active`, `pause`, `complete`, `cancelled`, `retry`, `draft`, `resend-scheduled`\]

Filter by schedule status

Default value:`active`

**emailStatus** string

**Possible values:** \[`all`, `not-started`, `paused`, `cancelled`, `processing`, `resumed`, `next-drip`, `complete`, `success`, `error`, `waiting`, `queued`, `queueing`, `reading`, `scheduled`\]

Filter by email delivery status

Default value:`complete`

**name** string

Filter campaigns by name

Example: Black Friday Campaign

**parentId** string

Filter campaigns by parent folder ID

Example: folder123

**limitedFields** boolean

When true, returns only essential campaign fields like id, templateDataDownloadUrl, updatedAt, type, templateType, templateId, downloadUrl and isPlainText. When false, returns complete campaign data including meta information, bulkRequestStatusInfo, ABTestInfo, resendScheduleInfo and all other campaign properties

Example: false

**archived** boolean

Filter archived campaigns

Example: false

**campaignsOnly** boolean

Return only campaigns, excluding folders

Example: false

**showStats** boolean

When true, returns campaign statistics including delivered count, opened count, clicked count and revenue if available for the campaign. When false, returns campaign data without statistics.

Example: true

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   403
*   404
*   422

Success

*   application/json

*   Schema
*   Example (auto)

**Schema**

**schedules** object\[\]required

The list of campaigns

*   Array \[
    

**name** stringrequired

Example:`Untitled new campaign`

**repeatAfter** stringrequired

**id** stringrequired

**parentId** stringrequired

**childCount** numberrequired

**campaignType** stringrequired

**bulkActionVersion** stringrequired

**\_id** stringrequired

**status** stringrequired

**sendDays** string\[\]required

**deleted** booleanrequired

**migrated** booleanrequired

**archived** booleanrequired

**hasTracking** booleanrequired

**isPlainText** booleanrequired

**hasUtmTracking** booleanrequired

**enableResendToUnopened** booleanrequired

**locationId** stringrequired

**templateId** stringrequired

**templateType** stringrequired

**createdAt** stringrequired

**updatedAt** stringrequired

**\_\_v** numberrequired

**documentId** stringrequired

**downloadUrl** stringrequired

**templateDataDownloadUrl** stringrequired

**child** string\[\]required

*   \]
    

**total** string\[\]required

The total number of campaigns

**traceId** stringrequired

Trace Id

```
{  "schedules": [    {      "name": "Untitled new campaign",      "repeatAfter": "string",      "id": "string",      "parentId": "string",      "childCount": 0,      "campaignType": "string",      "bulkActionVersion": "string",      "_id": "string",      "status": "string",      "sendDays": [        "string"      ],      "deleted": true,      "migrated": true,      "archived": true,      "hasTracking": true,      "isPlainText": true,      "hasUtmTracking": true,      "enableResendToUnopened": true,      "locationId": "string",      "templateId": "string",      "templateType": "string",      "createdAt": "string",      "updatedAt": "string",      "__v": 0,      "documentId": "string",      "downloadUrl": "string",      "templateDataDownloadUrl": "string",      "child": [        "string"      ]    }  ],  "total": [    "string"  ],  "traceId": "string"}
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

The token does not have access to this location

*   application/json

*   Schema
*   Example (auto)

**Schema**

**statusCode** number

Example:`403`

**message** string

Example:`The token does not have access to this location`

```
{  "statusCode": 403,  "message": "The token does not have access to this location"}
```

Not Found

*   application/json

*   Schema
*   Example (auto)

**Schema**

**statusCode** number

Example:`404`

**message** string

Example:`Not Found`

**error** string

Example:`The requested resource was not found`

```
{  "statusCode": 404,  "message": "Not Found",  "error": "The requested resource was not found"}
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

**name:** [Authorization](/docs/ghl/emails/email-api#authentication)**type:** http**scopes:** `emails/schedule.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/emails/schedule' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

limit — query

offset — query

status — query

\---activepausecompletecancelledretrydraftresend-scheduled

emailStatus — query

\---allnot-startedpausedcancelledprocessingresumednext-dripcompletesuccesserrorwaitingqueuedqueueingreadingscheduled

name — query

parentId — query

limitedFields — query

\---truefalse

archived — query

\---truefalse

campaignsOnly — query

\---truefalse

showStats — query

\---truefalse

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
