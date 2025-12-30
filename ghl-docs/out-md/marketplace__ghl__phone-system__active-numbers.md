# https://marketplace.gohighlevel.com/docs/ghl/phone-system/active-numbers

# List active numbers

GET 

## https://services.leadconnectorhq.com/phone-system/numbers/location/:locationId

Retrieve a paginated list of active phone numbers for a specific location. Supports filtering, pagination, and optional exclusion of number pool assignments.

### Requirements

#### Scope(s)

`phonenumbers.read`

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

**locationId** stringrequired

The unique identifier of the location

Example: ve9EPM428h8vShlRW1KT

### Query Parameters

**pageSize** number

**Possible values:** `>= 1` and `<= 1000`

How many resources to return in each list page. The default is 50, and the maximum is 1000.

Default value:`1000`

Example: 100

**page** number

The page index for pagination. The default is 0.

Default value:`0`

Example: 0

**searchFilter** string

Filter numbers by phone number pattern. Supports partial matching (e.g., "+91" to find all Indian numbers).

Example: +91

**skipNumberPool** boolean

Whether to exclude numbers that are assigned to number pools. Default is true.

Default value:`true`

Example:

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   404
*   500

Successfully retrieved list of active numbers

*   application/json

*   Schema
*   Example (auto)
*   successful-response
*   empty-response

**Schema**

**numbers** object\[\]required

Array of phone number objects with detailed configuration

*   Array \[
    

**phoneNumber** stringrequired

E.164 formatted phone number

Example:`+14155552671`

**friendlyName** stringnullable

Human-readable name assigned to the number

Example:`Sales Line 1`

**sid** stringrequired

Phone number SID (unique identifier)

Example:`PN1234567890abcdef1234567890abcde`

**countryCode** stringrequired

ISO 3166-1 alpha-2 country code

Example:`US`

**capabilities** objectrequired

Communication capabilities supported by this number

**voice** boolean

Whether the number supports voice calls

Example:`true`

**sms** boolean

Whether the number supports SMS messaging

Example:`true`

**mms** boolean

Whether the number supports MMS messaging

Example:`true`

**fax** boolean

Whether the number supports fax transmission

Example:`false`

**type** stringrequired

Type of phone number (local, toll-free, mobile, etc.)

**Possible values:** \[`local`, `toll-free`, `mobile`, `national`\]

Example:`local`

**isDefaultNumber** booleanrequired

Whether this is the default outbound number for the location

Example:`false`

**linkedUser** stringnullable

User ID of the user assigned to this number

Example:`user_123456789`

**linkedRingAllUsers** string\[\]required

Array of user IDs that should ring when this number is called

Example:`["user_123","user_456"]`

**inboundCallService** objectnullable

Configuration for inbound call handling service

**type** string

Type of inbound call service

**Possible values:** \[`voice_ai`, `ivr`, `forward`\]

Example:`voice_ai`

**value** string

Service configuration value or ID

Example:`68e381b296a83800a27cd1`

**forwardingNumber** stringnullable

Phone number to forward calls to

Example:`+14155552672`

**isGroupConversationEnabled** booleanrequired

Whether group conversations are enabled for this number (US/CA numbers with SMS/MMS only)

Example:`true`

**addressSid** stringnullable

Address SID for compliance purposes

Example:`AD1234567890abcdef1234567890abcde`

**bundleSid** stringnullable

Bundle SID for regulatory compliance

Example:`BU1234567890abcdef1234567890abcde`

**dateAdded** date-time

When the number was originally purchased/added

Example:`2023-01-15T10:30:00Z`

**dateUpdated** date-time

When the number configuration was last updated

Example:`2023-02-20T14:45:00Z`

**origin** string

Source or origin of the phone number

**Possible values:** \[`twilio`, `hosted`, `ported`\]

Example:`twilio`

*   \]
    

**isUnderGhl** booleanrequired

Whether this account is manged by LeadconnectorHQ

Example:`true`

**pageSize** numberrequired

Number of items requested per page

**Possible values:** `>= 1` and `<= 1000`

Example:`100`

**page** numberrequired

Current page index (0-based)

Example:`0`

**accountStatus** stringrequired

Current status of the account

**Possible values:** \[`active`, `suspended`, `closed`\]

Example:`active`

```
{  "numbers": [    {      "phoneNumber": "+14155552671",      "friendlyName": "Sales Line 1",      "sid": "PN1234567890abcdef1234567890abcde",      "countryCode": "US",      "capabilities": {        "voice": true,        "sms": true,        "mms": true,        "fax": false      },      "type": "local",      "isDefaultNumber": false,      "linkedUser": "user_123456789",      "linkedRingAllUsers": [        "user_123",        "user_456"      ],      "inboundCallService": {        "type": "voice_ai",        "value": "68e381b296a83800a27cd1"      },      "forwardingNumber": "+14155552672",      "isGroupConversationEnabled": true,      "addressSid": "AD1234567890abcdef1234567890abcde",      "bundleSid": "BU1234567890abcdef1234567890abcde",      "dateAdded": "2023-01-15T10:30:00Z",      "dateUpdated": "2023-02-20T14:45:00Z",      "origin": "twilio"    }  ],  "isUnderGhl": true,  "pageSize": 100,  "page": 0,  "accountStatus": "active"}
```

Successful response with phone numbers

```
{  "numbers": [    {      "phoneNumber": "+14155552671",      "friendlyName": "Sales Line 1",      "sid": "PN1234567890abcdef1234567890abcde",      "countryCode": "US",      "capabilities": {        "voice": true,        "sms": true,        "mms": true,        "fax": false      },      "type": "local",      "isDefaultNumber": true,      "linkedUser": "user_123456789",      "linkedRingAllUsers": [        "user_123",        "user_456"      ],      "inboundCallService": {        "type": "voice_ai",        "value": "68e381b296a83800a27cd1"      },      "forwardingNumber": "+14155552672",      "isGroupConversationEnabled": true,      "addressSid": "AD1234567890abcdef1234567890abcde",      "bundleSid": "BU1234567890abcdef1234567890abcde",      "dateAdded": "2023-01-15T10:30:00Z",      "dateUpdated": "2023-02-20T14:45:00Z",      "origin": "twilio"    },    {      "phoneNumber": "+18005551234",      "friendlyName": "Support Toll-Free",      "sid": "PN9876543210fedcba9876543210fedcb",      "countryCode": "US",      "capabilities": {        "voice": true,        "sms": false,        "mms": false,        "fax": false      },      "type": "toll-free",      "isDefaultNumber": false,      "linkedUser": null,      "linkedRingAllUsers": [        "user_789",        "user_101"      ],      "inboundCallService": null,      "forwardingNumber": null,      "isGroupConversationEnabled": false,      "addressSid": null,      "bundleSid": null,      "dateAdded": "2023-01-16T14:20:00Z",      "dateUpdated": "2023-01-16T14:20:00Z",      "origin": "twilio"    }  ],  "isUnderGhl": true,  "pageSize": 100,  "page": 0,  "accountStatus": "active"}
```

Response when no numbers are found

```
{  "numbers": [],  "total": 0}
```

Bad request - Invalid parameters

*   application/json

*   Schema
*   Example (auto)

**Schema**

**message** string

Example:`Invalid locationId format or pagination parameters`

**error** string

Example:`Bad Request`

**statusCode** number

Example:`400`

```
{  "message": "Invalid locationId format or pagination parameters",  "error": "Bad Request",  "statusCode": 400}
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

Phone system not connected

*   application/json

*   Schema
*   Example (auto)

**Schema**

**message** string

Example:`Phone system is not connected to this account`

**statusCode** number

Example:`404`

```
{  "message": "Phone system is not connected to this account",  "statusCode": 404}
```

Internal server error

*   application/json

*   Schema
*   Example (auto)

**Schema**

**msg** string

Example:`Internal server error`

**accountStatus** string

Account status when error occurs

Example:`suspended`

```
{  "msg": "Internal server error",  "accountStatus": "suspended"}
```

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/phone-system/phone-system-api#authentication)**type:** http**scopes:** `phonenumbers.read`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/phone-system/numbers/location/:locationId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — pathrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

pageSize — query

page — query

searchFilter — query

skipNumberPool — query

\---truefalse

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
