# https://marketplace.gohighlevel.com/docs/ghl/calendars/get-appointment-notes

# Get Notes

GET 

## https://services.leadconnectorhq.com/calendars/appointments/:appointmentId/notes

Get Appointment Notes

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

**appointmentId** stringrequired

Appointment ID

### Query Parameters

**limit** numberrequired

**Possible values:** `<= 20`

Limit of notes to fetch

Example: 10

**offset** numberrequired

Offset of notes to fetch

Example: 0

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**notes** object\[\]

*   Array \[
    

**id** string

Example:`HGPcayliwcdoUFzvbTok`

**body** string

Example:`lorem ipsum`

**userId** string

Example:`TUcmRxWrjqzJS8EjkxNK`

**dateAdded** string

Example:`2021-07-08T12:02:11.285Z`

**contactId** string

Example:`TUcmRxWrjqzJS8EjkxNK`

**createdBy** object

**id** string

Example:`TUcmRxWr`

**name** string

Example:`John Doe`

*   \]
    

**hasMore** boolean

Example:`true`

```
{  "notes": [    {      "id": "HGPcayliwcdoUFzvbTok",      "body": "lorem ipsum",      "userId": "TUcmRxWrjqzJS8EjkxNK",      "dateAdded": "2021-07-08T12:02:11.285Z",      "contactId": "TUcmRxWrjqzJS8EjkxNK",      "createdBy": {        "id": "TUcmRxWr",        "name": "John Doe"      }    }  ],  "hasMore": true}
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
curl -L 'https://services.leadconnectorhq.com/calendars/appointments/:appointmentId/notes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

appointmentId — pathrequired

limit — queryrequired

offset — queryrequired

Version — headerrequired

\---2021-04-15

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
