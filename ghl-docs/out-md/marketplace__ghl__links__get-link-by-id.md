# https://marketplace.gohighlevel.com/docs/ghl/links/get-link-by-id

# Get Link by ID

GET 

## https://services.leadconnectorhq.com/links/id/:linkId

Get a single link by its ID

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Authorization** stringrequired

Access Token

Example: Bearer 9c48df2694a849b6089f9d0d3513efe

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Path Parameters

**linkId** stringrequired

Link Id

### Query Parameters

**locationId** stringrequired

Location Id

Example: ABCHkzuJQ8ZMd4Te84GK

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

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

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/links/trigger-links-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/links/id/:linkId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

linkId — pathrequired

locationId — queryrequired

Authorization — headerrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
