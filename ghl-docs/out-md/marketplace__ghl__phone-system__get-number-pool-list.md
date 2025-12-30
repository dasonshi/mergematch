# https://marketplace.gohighlevel.com/docs/ghl/phone-system/get-number-pool-list

# List Number Pools

GET 

## https://services.leadconnectorhq.com/phone-system/number-pools

Get list of number pools

### Requirements

#### Scope(s)

`numberpools.read`

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

**locationId** string

Location ID to filter pools

Example: ve9EPM428h8vShlRW1KT

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   403

Successfully retrieved number pools list

*   application/json

*   Schema
*   Example (auto)
*   successful-response

**Schema**

**success** boolean

Indicates if the request was successful

Example:`true`

**data** object\[\]

Array of number pool objects

*   Array \[
    

**id** string

Unique identifier for the number pool

Example:`ve9EPM428h8vShlRW1KT`

**name** string

Human-readable name of the number pool

Example:`Sales Team Pool`

**locationId** string

Location ID this pool belongs to

Example:`loc123`

**numbers** object\[\]

Phone numbers in this pool

*   Array \[
    

**phoneNumber** string

E.164 formatted phone number

Example:`+14155552671`

**friendlyName** string

Human-readable name for the number

Example:`Sales Line 1`

*   \]
    

**forwardingNumber** string

Number to forward calls to

Example:`+14155552671`

**whisper** boolean

Whether whisper is enabled

Example:`true`

**whisperMessage** string

Message played during whisper

Example:`Incoming call from sales line`

**callRecording** boolean

Whether call recording is enabled

Example:`true`

**isActive** boolean

Whether the number pool is active

Example:`true`

**inboundCallService** objectnullable

Inbound call service configuration

**type** string

Type of inbound call service

Example:`voice_ai`

**value** string

Service configuration value/ID

Example:`68e381b296a83800a27cd1`

*   \]
    

**total** number

Total number of pools returned

Example:`5`

```
{  "success": true,  "data": [    {      "id": "ve9EPM428h8vShlRW1KT",      "name": "Sales Team Pool",      "locationId": "loc123",      "numbers": [        {          "phoneNumber": "+14155552671",          "friendlyName": "Sales Line 1"        }      ],      "forwardingNumber": "+14155552671",      "whisper": true,      "whisperMessage": "Incoming call from sales line",      "callRecording": true,      "isActive": true,      "inboundCallService": {        "type": "voice_ai",        "value": "68e381b296a83800a27cd1"      }    }  ],  "total": 5}
```

Successful response with number pools

```
{  "success": true,  "data": [    {      "id": "ve9EPM428h8vShlRW1KT",      "name": "Sales Team Pool",      "locationId": "loc123",      "numbers": [        {          "phoneNumber": "+14155552671",          "friendlyName": "Sales Line 1"        }      ],      "forwardingNumber": "+14155552671",      "whisper": true,      "whisperMessage": "Incoming call from sales line",      "callRecording": true,      "isActive": true,      "inboundCallService": {        "type": "voice_ai",        "value": "68e381b296a83800a27cd1"      }    }  ],  "total": 1}
```

Bad request - Invalid location ID or parameters

*   application/json

*   Schema
*   Example (auto)

**Schema**

**message** string

Example:`Invalid locationId format`

**error** string

Example:`Bad Request`

**statusCode** number

Example:`400`

```
{  "message": "Invalid locationId format",  "error": "Bad Request",  "statusCode": 400}
```

Unauthorized - Invalid or missing authentication token

Forbidden - Insufficient permissions for this location

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/phone-system/phone-system-api#authentication)**type:** http**scopes:** `numberpools.read`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/phone-system/number-pools' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

Show optional parameters

locationId — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
