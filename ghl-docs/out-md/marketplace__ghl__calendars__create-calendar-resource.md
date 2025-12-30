# https://marketplace.gohighlevel.com/docs/ghl/calendars/create-calendar-resource

# Create Calendar Resource

POST 

## https://services.leadconnectorhq.com/calendars/resources/:resourceType

Create calendar resource by resource type

### Requirements

#### Scope(s)

`calendars/resources.write`

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

**resourceType** stringrequired

**Possible values:** \[`equipments`, `rooms`\]

Calendar Resource Type

*   application/json

### Body**required**

**locationId** stringrequired

**name** stringrequired

**description** stringrequired

**quantity** numberrequired

Quantity of the equipment.

**outOfService** numberrequired

Quantity of the out of service equipment.

**capacity** numberrequired

Capacity of the room.

**calendarIds** string\[\]required

Service calendar IDs to be mapped with the resource.

```
One equipment can only be mapped with one service calendar.
```

One room can be mapped with multiple service calendars.

**Possible values:** `<= 100`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401

Calendar resource created

*   application/json

*   Schema
*   Example (auto)

**Schema**

**locationId** stringrequired

Location ID of the resource

**name** stringrequired

Name of the resource

Example:`yoga room`

**resourceType** stringrequired

**Possible values:** \[`equipments`, `rooms`\]

**isActive** booleanrequired

Whether the resource is active

**description** string

Description of the resource

**quantity** number

Quantity of the resource

**outOfService** number

Indicates if the resource is out of service

Example:`0`

**capacity** number

Capacity of the resource

Example:`85`

**calendarIds** string\[\]required

Calendar IDs

Example:`["Jsj0xnlDDjw0SuvX1J13","oCM5feFC86FAAbcO7lJK"]`

```
{  "locationId": "string",  "name": "yoga room",  "resourceType": "equipments",  "isActive": true,  "description": "string",  "quantity": 0,  "outOfService": 0,  "capacity": 85,  "calendarIds": [    "Jsj0xnlDDjw0SuvX1J13",    "oCM5feFC86FAAbcO7lJK"  ]}
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

**name:** [Authorization](/docs/ghl/calendars/calendars-api#authentication)**type:** http**scopes:** `calendars/resources.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/calendars/resources/:resourceType' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationId": "string",  "name": "string",  "description": "string",  "quantity": 0,  "outOfService": 0,  "capacity": 0,  "calendarIds": [    "string"  ]}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

resourceType — pathrequired

\---equipmentsrooms

Version — headerrequired

\---2021-04-15

Body required

{
  "locationId": "string",  "name": "string",  "description": "string",  "quantity": 0,  "outOfService": 0,  "capacity": 0,  "calendarIds": \[    "string"  \]
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
