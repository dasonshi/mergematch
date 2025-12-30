# https://marketplace.gohighlevel.com/docs/ghl/calendars/get-event-notification

# Get notifications

GET 

## https://services.leadconnectorhq.com/calendars/:calendarId/notifications

Get calendar notifications based on query

### Requirements

#### Scope(s)

`calendars/events.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-04-15`\]

API Version

### Path Parameters

**calendarId** stringrequired

### Query Parameters

**isActive** boolean

**deleted** boolean

**limit** number

Number of records to return

Default value:`100`

**skip** number

Number of records to skip

Default value:`0`

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

*   Array \[
    

**\_id** string

Notification ID

**receiverType** string

**Possible values:** \[`contact`, `guest`, `assignedUser`, `emails`\]

Example:`contact`

**additionalEmailIds** string\[\]

Example:`["example1@email.com","example2@email.com"]`

**channel** string

**Possible values:** \[`email`, `inApp`\]

Example:`email`

**notificationType** string

**Possible values:** \[`booked`, `confirmation`, `cancellation`, `reminder`, `followup`, `reschedule`\]

Example:`confirmation`

**isActive** boolean

Example:`true`

**templateId** string

Example:`0as9d8as0d`

**body** string

Example:`This is a test notification`

**subject** string

Example:`Test Notification`

**afterTime** object\[\]

*   Array \[
    

**timeOffset** number

**unit** string

*   \]
    

**beforeTime** object\[\]

*   Array \[
    

**timeOffset** number

**unit** string

*   \]
    

**selectedUsers** string\[\]

Example:`["user1","user2"]`

**deleted** boolean

Example:`false`

*   \]
    

```
[  {    "_id": "string",    "receiverType": "contact",    "additionalEmailIds": [      "example1@email.com",      "example2@email.com"    ],    "channel": "email",    "notificationType": "confirmation",    "isActive": true,    "templateId": "0as9d8as0d",    "body": "This is a test notification",    "subject": "Test Notification",    "afterTime": [      {        "timeOffset": 1,        "unit": "hours"      }    ],    "beforeTime": [      {        "timeOffset": 1,        "unit": "hours"      }    ],    "selectedUsers": [      "user1",      "user2"    ],    "deleted": false  }]
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

**name:** [Authorization](/docs/ghl/calendars/calendars-api#authentication)**type:** http**scopes:** `calendars/events.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/calendars/:calendarId/notifications' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

calendarId — pathrequired

Version — headerrequired

\---2021-04-15

Show optional parameters

isActive — query

\---truefalse

deleted — query

\---truefalse

limit — query

skip — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
