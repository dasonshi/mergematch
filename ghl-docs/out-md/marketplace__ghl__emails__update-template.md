# https://marketplace.gohighlevel.com/docs/ghl/emails/update-template

# Update a template

POST 

## https://services.leadconnectorhq.com/emails/builder/data

Update a template

### Requirements

#### Scope(s)

`emails/builder.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

*   application/json

### Body**required**

**locationId** stringrequired

Example:`ve9EPM428h8vShlRW1KT`

**templateId** stringrequired

Example:`zYy3YOUuHxgomU1uYJty`

**updatedBy** stringrequired

Example:`zYy3YOUuHxgomU1uYJty`

**dnd** object

**elements** string\[\]required

**attrs** objectrequired

**templateSettings** objectrequired

object

**html** stringrequired

Example:

**editorType** stringrequired

**Possible values:** \[`html`, `builder`\]

**previewText** string

Example:`zYy3YOUuHxgomU1uYJty`

**isPlainText** boolean

Example:`false`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   404
*   422

Success

*   application/json

*   Schema
*   Example (auto)

**Schema**

**ok** string

ok

Example:`true`

**traceId** string

trace id

Example:`0c52e980-41f6-4be7-8c4b-32332ss`

**previewUrl** string

preview url

Example:`https://example.com`

**templateDownloadUrl** string

template data download url

Example:`https://example.com`

```
{  "ok": "true",  "traceId": "0c52e980-41f6-4be7-8c4b-32332ss",  "previewUrl": "https://example.com",  "templateDownloadUrl": "https://example.com"}
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

Not Found

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

**name:** [Authorization](/docs/ghl/emails/email-api#authentication)**type:** http**scopes:** `emails/builder.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/emails/builder/data' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationId": "ve9EPM428h8vShlRW1KT",  "templateId": "zYy3YOUuHxgomU1uYJty",  "updatedBy": "zYy3YOUuHxgomU1uYJty",  "dnd": "{elements:[], attrs:{}, templateSettings:{}}",  "html": "",  "editorType": "html",  "previewText": "zYy3YOUuHxgomU1uYJty",  "isPlainText": "false"}'
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

Body required

{
  "locationId": "ve9EPM428h8vShlRW1KT",  "templateId": "zYy3YOUuHxgomU1uYJty",  "updatedBy": "zYy3YOUuHxgomU1uYJty",  "dnd": "{elements:\[\], attrs:{}, templateSettings:{}}",  "html": "",  "editorType": "html",  "previewText": "zYy3YOUuHxgomU1uYJty",  "isPlainText": "false"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
