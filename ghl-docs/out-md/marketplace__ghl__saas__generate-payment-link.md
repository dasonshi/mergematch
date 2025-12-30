# https://marketplace.gohighlevel.com/docs/ghl/saas/generate-payment-link

# Update SaaS subscription

PUT 

## https://services.leadconnectorhq.com/saas/update-saas-subscription/:locationId

Update SaaS subscription for given locationId and customerId

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

**subscriptionId** stringrequired

Subscription ID

Example:`sub_1QDPY5FpU9DlKp7RQ8BXfywx`

**customerId** stringrequired

Customer ID

Example:`cus_1QDPY5FpU9DlKp7RQ8BXfywx`

**companyId** stringrequired

Company ID

Example:`companyId1`

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
curl -L -X PUT 'https://services.leadconnectorhq.com/saas/update-saas-subscription/:locationId' \-H 'Content-Type: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "subscriptionId": "sub_1QDPY5FpU9DlKp7RQ8BXfywx",  "customerId": "cus_1QDPY5FpU9DlKp7RQ8BXfywx",  "companyId": "companyId1"}'
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
  "subscriptionId": "sub\_1QDPY5FpU9DlKp7RQ8BXfywx",  "customerId": "cus\_1QDPY5FpU9DlKp7RQ8BXfywx",  "companyId": "companyId1"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
