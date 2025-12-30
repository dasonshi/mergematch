# https://marketplace.gohighlevel.com/docs/ghl/calendars/update-event-notification

# Update notification

PUT 

## https://services.leadconnectorhq.com/calendars/:calendarId/notifications/:notificationId

Update Event notification by id

### Requirements

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

**notificationId** stringrequired

*   application/json

### Body**required**

**receiverType** string

Notification recipient type

**Possible values:** \[`contact`, `guest`, `assignedUser`, `emails`\]

**additionalEmailIds** string\[\]

Additional email addresses to receive notifications.

Example:`["example1@email.com","example2@email.com"]`

**selectedUsers** string\[\]

selected user for in-App notification

**channel** string

Notification channel

**Possible values:** \[`email`, `inApp`\]

**notificationType** string

Notification type

**Possible values:** \[`booked`, `confirmation`, `cancellation`, `reminder`, `followup`, `reschedule`\]

**isActive** boolean

Is the notification active

**Default value:** `true`

**deleted** boolean

Marks the notification as deleted (soft delete)

**Default value:** `false`

**templateId** string

Template ID for email notification

**body** string

Body for email notification. Not necessary for in-App notification

**subject** string

Subject for email notification. Not necessary for in-App notification

**afterTime** object\[\]

Specifies the time after which the follow-up notification should be sent. This is not required for other notification types.

*   Array \[
    

**timeOffset** number

**unit** string

*   \]
    

**beforeTime** object\[\]

Specifies the time before which the reminder notification should be sent. This is not required for other notification types.

*   Array \[
    

**timeOffset** number

**unit** string

*   \]
    

**fromAddress** string

From address for email notification

**fromName** string

From name for email notification

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**message** stringrequired

Result of delete/update operation

```
{  "message": "string"}
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

**name:** [Authorization](/docs/ghl/calendars/calendars-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PUT 'https://services.leadconnectorhq.com/calendars/:calendarId/notifications/:notificationId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "receiverType": "contact",  "additionalEmailIds": [    "example1@email.com",    "example2@email.com"  ],  "selectedUsers": [    "string"  ],  "channel": "email",  "notificationType": "booked",  "isActive": true,  "deleted": false,  "templateId": "string",  "body": "string",  "subject": "string",  "afterTime": [    {      "timeOffset": 1,      "unit": "hours"    }  ],  "beforeTime": [    {      "timeOffset": 1,      "unit": "hours"    }  ],  "fromAddress": "string",  "fromName": "string"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

calendarId — pathrequired

notificationId — pathrequired

Version — headerrequired

\---2021-04-15

Body required

{
  "receiverType": "contact",  "additionalEmailIds": \[    "example1@email.com",    "example2@email.com"  \],  "selectedUsers": \[    "string"  \],  "channel": "email",  "notificationType": "booked",  "isActive": true,  "deleted": false,  "templateId": "string",  "body": "string",  "subject": "string",  "afterTime": \[    {      "timeOffset": 1,      "unit": "hours"    }  \],  "beforeTime": \[    {      "timeOffset": 1,      "unit": "hours"    }  \],  "fromAddress": "string",  "fromName": "string"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
