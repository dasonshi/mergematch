# https://marketplace.gohighlevel.com/docs/ghl/saas/bulk-disable-saas

# Disable SaaS for locations

POST 

## https://services.leadconnectorhq.com/saas/bulk-disable-saas/:companyId

Disable SaaS for locations for given locationIds

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

**companyId** stringrequired

*   application/json

### Body**required**

**locationIds** string\[\]required

Location IDs

Example:`["locationId1","locationId2"]`

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
curl -L 'https://services.leadconnectorhq.com/saas/bulk-disable-saas/:companyId' \-H 'Content-Type: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationIds": [    "locationId1",    "locationId2"  ]}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

companyId — pathrequired

Version — headerrequired

\---2021-04-15

Body required

{
  "locationIds": \[    "locationId1",    "locationId2"  \]
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
