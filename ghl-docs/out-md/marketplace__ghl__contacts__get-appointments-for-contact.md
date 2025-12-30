# https://marketplace.gohighlevel.com/docs/ghl/contacts/get-appointments-for-contact

# Get Appointments for Contact

GET 

## https://services.leadconnectorhq.com/contacts/:contactId/appointments

Get Appointments for Contact

### Requirements

#### Scope(s)

`contacts.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Path Parameters

**contactId** stringrequired

Contact Id

Example: sx6wyHhbFdRXh302LLNR

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   422

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**events** object\[\]

*   Array \[
    

**id** string

Example:`YS3jaqqeehkR2Is80miy`

**calendarId** string

Example:`YlWd2wuCAZQzh2cH1fVZ`

**status** string

Example:`booked`

**title** string

Example:`Test`

**assignedUserId** string

Example:`YlWd2wuCAZQzh2cH1fVZ`

**notes** string

Example:`test`

**startTime** string

Example:`2021-07-16 11:00:00`

**endTime** string

Example:`2021-07-16 11:30:00`

**address** string

Example:`Address`

**locationId** string

Example:`YlWd2wuCAZQzh2cH1fVZ`

**contactId** string

Example:`YlWd2wuCAZQzh2cH1fVZ`

**groupId** string

Example:`YlWd2wuCAZQzh2cH1fVZ`

**appointmentStatus** string

Example:`booked`

**users** string\[\]

Example:`["YlWd2wuCAZQzh2cH1fVZ","YlWd2wuCAZQzh2cH1fVZ"]`

**dateAdded** string

Example:`2021-07-16 11:00:00`

**dateUpdated** string

Example:`2021-07-16 11:30:00`

**assignedResources** string\[\]

Example:`["YlWd2wuCAZQzh2cH1fVZ","YlWd2wuCAZQzh2cH1fVZ"]`

*   \]
    

```
{  "events": [    {      "id": "YS3jaqqeehkR2Is80miy",      "calendarId": "YlWd2wuCAZQzh2cH1fVZ",      "status": "booked",      "title": "Test",      "assignedUserId": "YlWd2wuCAZQzh2cH1fVZ",      "notes": "test",      "startTime": "2021-07-16 11:00:00",      "endTime": "2021-07-16 11:30:00",      "address": "Address",      "locationId": "YlWd2wuCAZQzh2cH1fVZ",      "contactId": "YlWd2wuCAZQzh2cH1fVZ",      "groupId": "YlWd2wuCAZQzh2cH1fVZ",      "appointmentStatus": "booked",      "users": [        "YlWd2wuCAZQzh2cH1fVZ",        "YlWd2wuCAZQzh2cH1fVZ"      ],      "dateAdded": "2021-07-16 11:00:00",      "dateUpdated": "2021-07-16 11:30:00",      "assignedResources": [        "YlWd2wuCAZQzh2cH1fVZ",        "YlWd2wuCAZQzh2cH1fVZ"      ]    }  ]}
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

**name:** [Authorization](/docs/ghl/contacts/contacts-api#authentication)**type:** http**scopes:** `contacts.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/contacts/:contactId/appointments' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

contactId — pathrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
