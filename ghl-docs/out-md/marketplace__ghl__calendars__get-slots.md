# https://marketplace.gohighlevel.com/docs/ghl/calendars/get-slots

# Get Free Slots

GET 

## https://services.leadconnectorhq.com/calendars/:calendarId/free-slots

Get free slots for a calendar between a date range. Optionally a consumer can also request free slots in a particular timezone and also for a particular user.

### Requirements

#### Scope(s)

`calendars.readonly`

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

Calendar Id

Example: ocQHyuzHvysMo5N5VsXc

### Query Parameters

**startDate** numberrequired

Start Date (**⚠️ Important:** Date range cannot be more than 31 days)

Example: 1548898600000

**endDate** numberrequired

End Date (**⚠️ Important:** Date range cannot be more than 31 days)

Example: 1601490599999

**timezone** string

The timezone in which the free slots are returned

Example: America/Chihuahua

**userId** string

The user for whom the free slots are returned

Example: 082goXVW3lIExEQPOnd3

**userIds** string\[\]

The users for whom the free slots are returned

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**\_dates\_** objectrequired

**slots** string\[\]required

```
{  "_dates_": {    "slots": [      "string"    ]  }}
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

**name:** [Authorization](/docs/ghl/calendars/calendars-api#authentication)**type:** http**scopes:** `calendars.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/calendars/:calendarId/free-slots' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

calendarId — pathrequired

startDate — queryrequired

endDate — queryrequired

Version — headerrequired

\---2021-04-15

Show optional parameters

timezone — query

userId — query

userIds — query

Add item

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
