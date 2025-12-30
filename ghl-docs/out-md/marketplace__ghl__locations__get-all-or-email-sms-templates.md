# https://marketplace.gohighlevel.com/docs/ghl/locations/get-all-or-email-sms-templates

# GET all or email/sms templates

GET 

## https://services.leadconnectorhq.com/locations/:locationId/templates

GET all or email/sms templates

### Requirements

#### Scope(s)

`locations/templates.readonly`

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

Location Id

Example: ve9EPM428h8vShlRW1KT

### Query Parameters

**deleted** boolean

Default value:`false`

**skip** string

Default value:`0`

Example: 1

**limit** string

Default value:`25`

Example: 25

**type** string

**Possible values:** \[`sms`, `email`, `whatsapp`\]

**originId** stringrequired

Origin Id

Example: ve9EPM428h8vShlRW1KT

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

**templates** object\[\]

*   Array \[
    
oneOf

*   GetSmsTemplateResponseSchema
*   GetEmailTemplateResponseSchema

**id** string

Example:`2yMwhgTNO19bpintqrap`

**name** string

Example:`sms template`

**type** string

Example:`sms`

**template** object

**body** string

Example:`sms body`

**attachments** array\[\]

Example:`[]`

**dateAdded** string

Example:`2022-01-27T12:31:19.679Z`

**locationId** string

Example:`ve9EPM428h8vShlRW1KT`

**urlAttachments** string\[\]

Example:`[]`

**id** string

Example:`2yMwhgTNO19bpintqrap`

**name** string

Example:`email template`

**type** string

Example:`email`

**dateAdded** string

Example:`2022-01-27T12:31:19.679Z`

**template** object

**subject** string

Example:`subject text`

**attachments** array\[\]

Example:`[]`

**html** string

Example:`<html><head><style>body{font-family: sans-serif;}</style></head><body>testing</body></html>`

**locationId** string

Example:`ve9EPM428h8vShlRW1KT`

*   \]
    

**totalCount** number

Example:`100`

```
{  "templates": [    {      "id": "2yMwhgTNO19bpintqrap",      "name": "sms template",      "type": "sms",      "template": {        "body": "sms body",        "attachments": []      },      "dateAdded": "2022-01-27T12:31:19.679Z",      "locationId": "ve9EPM428h8vShlRW1KT",      "urlAttachments": []    },    {      "id": "2yMwhgTNO19bpintqrap",      "name": "email template",      "type": "email",      "dateAdded": "2022-01-27T12:31:19.679Z",      "template": {        "subject": "subject text",        "attachments": [],        "html": "<html><head><style>body{font-family: sans-serif;}</style></head><body>testing</body></html>"      },      "locationId": "ve9EPM428h8vShlRW1KT"    }  ],  "totalCount": 100}
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

**name:** [Authorization](/docs/ghl/locations/sub-account-formerly-location-api#authentication)**type:** http**scopes:** `locations/templates.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/locations/:locationId/templates' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — pathrequired

originId — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

deleted — query

\---truefalse

skip — query

limit — query

type — query

\---smsemailwhatsapp

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
