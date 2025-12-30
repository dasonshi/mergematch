# https://marketplace.gohighlevel.com/docs/ghl/calendars/edit-block-slot

# Update Block Slot

PUT 

## https://services.leadconnectorhq.com/calendars/events/block-slots/:eventId

Update block slot by ID

### Requirements

#### Scope(s)

`calendars/events.write`

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

**eventId** stringrequired

Event Id or Instance id. For recurring appointments send masterEventId to modify original series.

Examples:

*   example1
*   example2

Event ID

Example:`ocQHyuzHvysMo5N5VsXc`

Recurring Instance ID

Example:`ocQHyuzHvysMo5N5VsXc_1729821600000_1800`

*   application/json

### Body**required**

**title** string

Title

Example:`Test Event`

**calendarId** stringrequired

Calendar Id

Example:`CVokAlI8fgw4WYWoCtQz`

**assignedUserId** string

Assigned User Id

Example:`CVokAlI8fgw4WYWoCtQz`

**locationId** stringrequired

Location Id

Example:`C2QujeCh8ZnC7al2InWR`

**startTime** string

Start Time

Example:`2021-06-23T03:30:00+05:30`

**endTime** string

End Time

Example:`2021-06-23T04:30:00+05:30`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**id** stringrequired

Id

Example:`0TkCdp9PfvLeWKYRRvIz`

**locationId** stringrequired

Location Id

Example:`C2QujeCh8ZnC7al2InWR`

**title** stringrequired

Title

Example:`My event`

**startTime** objectrequired

Start Time

Example:`2021-06-23T03:30:00+05:30`

**endTime** objectrequired

End Time

Example:`2021-06-23T04:30:00+05:30`

**calendarId** string

Calendar id

Example:`CVokAlI8fgw4WYWoCtQz`

**assignedUserId** string

Assigned User Id

Example:`0007BWpSzSwfiuSl0tR2`

```
{  "id": "0TkCdp9PfvLeWKYRRvIz",  "locationId": "C2QujeCh8ZnC7al2InWR",  "title": "My event",  "startTime": "2021-06-23T03:30:00+05:30",  "endTime": "2021-06-23T04:30:00+05:30",  "calendarId": "CVokAlI8fgw4WYWoCtQz",  "assignedUserId": "0007BWpSzSwfiuSl0tR2"}
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

**name:** [Authorization](/docs/ghl/calendars/calendars-api#authentication)**type:** http**scopes:** `calendars/events.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PUT 'https://services.leadconnectorhq.com/calendars/events/block-slots/:eventId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "title": "Test Event",  "calendarId": "CVokAlI8fgw4WYWoCtQz",  "assignedUserId": "CVokAlI8fgw4WYWoCtQz",  "locationId": "C2QujeCh8ZnC7al2InWR",  "startTime": "2021-06-23T03:30:00+05:30",  "endTime": "2021-06-23T04:30:00+05:30"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

eventId — pathrequired

Version — headerrequired

\---2021-04-15

Body required

{
  "title": "Test Event",  "calendarId": "CVokAlI8fgw4WYWoCtQz",  "assignedUserId": "CVokAlI8fgw4WYWoCtQz",  "locationId": "C2QujeCh8ZnC7al2InWR",  "startTime": "2021-06-23T03:30:00+05:30",  "endTime": "2021-06-23T04:30:00+05:30"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
