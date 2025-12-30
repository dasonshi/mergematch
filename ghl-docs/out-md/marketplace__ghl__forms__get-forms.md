# https://marketplace.gohighlevel.com/docs/ghl/forms/get-forms

# Get Forms

GET 

## https://services.leadconnectorhq.com/forms/

Get Forms

### Requirements

#### Scope(s)

`forms.readonly`

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

**skip** number

Example: 0

**limit** number

Limit Per Page records count. will allow maximum up to 50 and default will be 10

Default value:`10`

Example: 20

**type** string

Example: folder

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**forms** object\[\]

*   Array \[
    

**id** string

Example:`YSWdvS4Is98wtIDGnpmI`

**name** string

Example:`Form 1`

**locationId** string

Example:`ve9EPM428h8vShlRW1KT`

*   \]
    

**total** number

Total number of forms

Example:`20`

```
{  "forms": [    {      "id": "YSWdvS4Is98wtIDGnpmI",      "name": "Form 1",      "locationId": "ve9EPM428h8vShlRW1KT"    }  ],  "total": "20"}
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

**name:** [Authorization](/docs/ghl/forms/forms-api#authentication)**type:** http**scopes:** `forms.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/forms/' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

skip — query

limit — query

type — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
