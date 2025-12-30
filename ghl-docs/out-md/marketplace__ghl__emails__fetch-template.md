# https://marketplace.gohighlevel.com/docs/ghl/emails/fetch-template

# Fetch email templates

GET 

## https://services.leadconnectorhq.com/emails/builder

Fetch email templates by location id

### Requirements

#### Scope(s)

`emails/builder.readonly`

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

**locationId** stringrequired

Example: ve9EPM428h8vShlRW1KT

**limit** string

Default value:`10`

**offset** string

Default value:`0`

**search** string

Default value:

**sortByDate** string

Default value:`desc`

**archived** string

Default value:`false`

**builderVersion** string

**Possible values:** \[`1`, `2`\]

Default value:`2`

**name** string

Default value:

**parentId** string

Default value:

**originId** string

Example: ve9EPM428h8vShlRW1KT

**templatesOnly** string

Default value:`false`

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   404
*   422

Success

*   application/json

*   Schema
*   Example (auto)

**Schema**

**name** string

template name

Example:`New Template`

**updatedBy** string

updated by

Example:`John Doe`

**isPlainText** boolean

plain text based template

Example:`false`

**lastUpdated** string

last updated

Example:`2024-11-12T12:34:36.070Z`

**dateAdded** string

date added

Example:`2024-11-12T12:34:36.070Z`

**previewUrl** string

preview url

Example:`https://example.com`

**id** string

id

Example:`67334b231f2fad724062f52b5`

**version** string

version

Example:`1`

**templateType** string

type

Example:`builder`

```
{  "name": "New Template",  "updatedBy": "John Doe",  "isPlainText": "false",  "lastUpdated": "2024-11-12T12:34:36.070Z",  "dateAdded": "2024-11-12T12:34:36.070Z",  "previewUrl": "https://example.com",  "id": "67334b231f2fad724062f52b5",  "version": "1",  "templateType": "builder"}
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

**name:** [Authorization](/docs/ghl/emails/email-api#authentication)**type:** http**scopes:** `emails/builder.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/emails/builder' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

limit — query

offset — query

search — query

sortByDate — query

archived — query

builderVersion — query

\---12

name — query

parentId — query

originId — query

templatesOnly — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
