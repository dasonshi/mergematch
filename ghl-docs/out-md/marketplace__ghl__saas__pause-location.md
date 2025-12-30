# https://marketplace.gohighlevel.com/docs/ghl/saas/pause-location

# Pause location

POST 

## https://services.leadconnectorhq.com/saas/pause/:locationId

Pause Sub account for given locationId

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-04-15`\]

API Version

### Path Parameters

**locationId** stringrequired

*   application/json

### Body**required**

**paused** booleanrequired

Paused

Example:`true`

**companyId** stringrequired

Company ID

Example:`companyId1`

## Responses[​](#responses "Direct link to Responses")

*   201

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/saas/saas-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Company

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
curl -L 'https://services.leadconnectorhq.com/saas/pause/:locationId' \-H 'Content-Type: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "paused": true,  "companyId": "companyId1"}'
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

\---2021-04-15

Body required

{
  "paused": true,  "companyId": "companyId1"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
