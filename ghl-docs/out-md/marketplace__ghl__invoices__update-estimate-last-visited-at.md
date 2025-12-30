# https://marketplace.gohighlevel.com/docs/ghl/invoices/update-estimate-last-visited-at

# Update estimate last visited at

PATCH 

## https://services.leadconnectorhq.com/invoices/estimate/stats/last-visited-at

API to update estimate last visited at by estimate id

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token``Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

*   application/json

### Body**required**

**estimateId** stringrequired

Estimate Id

Example:`5f9d6d8b1b2d2c001f2d9e4b`

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

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

**name:** [Authorization](/docs/ghl/invoices/invoice-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PATCH 'https://services.leadconnectorhq.com/invoices/estimate/stats/last-visited-at' \-H 'Content-Type: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "estimateId": "5f9d6d8b1b2d2c001f2d9e4b"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Security Scheme

Location-AccessAgency-Access

Bearer Token

Parameters

Version — headerrequired

\---2021-07-28

Body required

{
  "estimateId": "5f9d6d8b1b2d2c001f2d9e4b"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
