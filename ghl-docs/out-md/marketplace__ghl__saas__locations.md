# https://marketplace.gohighlevel.com/docs/ghl/saas/locations

# Get locations by stripeId with companyId

GET 

## https://services.leadconnectorhq.com/saas/locations

Get locations by stripeCustomerId or stripeSubscriptionId with companyId

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

### Query Parameters

**customerId** stringrequired

**subscriptionId** stringrequired

**companyId** stringrequired

## Responses[​](#responses "Direct link to Responses")

*   200

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
curl -L 'https://services.leadconnectorhq.com/saas/locations' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

customerId — queryrequired

subscriptionId — queryrequired

companyId — queryrequired

Version — headerrequired

\---2021-04-15

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
