# https://marketplace.gohighlevel.com/docs/ghl/links/create-link

# Create Link

POST 

## https://services.leadconnectorhq.com/links/

Create Link

### Requirements

#### Scope(s)

`links.write`

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

**name** stringrequired

Example:`first tag`

**redirectTo** stringrequired

Example:`https://www.google.com/`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   422

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**link** object

**id** string

Example:`n4AriwEnFrGh3tu08W0U`

**name** string

Example:`first tag`

**redirectTo** string

Example:`https://www.google.com/`

**fieldKey** string

Example:`{{trigger_link.n4AriwEnFrGh3tu08W0U}}`

**locationId** string

Example:`ve9EPM428h8vShlRW1KT`

```
{  "link": {    "id": "n4AriwEnFrGh3tu08W0U",    "name": "first tag",    "redirectTo": "https://www.google.com/",    "fieldKey": "{{trigger_link.n4AriwEnFrGh3tu08W0U}}",    "locationId": "ve9EPM428h8vShlRW1KT"  }}
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

**name:** [Authorization](/docs/ghl/links/trigger-links-api#authentication)**type:** http**scopes:** `links.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/links/' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationId": "ve9EPM428h8vShlRW1KT",  "name": "first tag",  "redirectTo": "https://www.google.com/"}'
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
  "locationId": "ve9EPM428h8vShlRW1KT",  "name": "first tag",  "redirectTo": "https://www.google.com/"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
