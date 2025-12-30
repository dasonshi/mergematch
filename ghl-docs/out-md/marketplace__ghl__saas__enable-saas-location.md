# https://marketplace.gohighlevel.com/docs/ghl/saas/enable-saas-location

# Enable SaaS for Sub-Account (Formerly Location)

POST 

## https://services.leadconnectorhq.com/saas/enable-saas/:locationId

Enable SaaS for Sub-Account (Formerly Location) based on the data provided

info

This feature is only available on Agency Pro ($497) plan.

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

**stripeAccountId** string

Stripe account id(Required only for SaaS V1)

Example:`acct_1QDPY5FpU9DlKp7RQ8BXfywx`

**name** string

Name of the stripe customer(Required only for SaaS V1)

Example:`John Doe`

**email** string

Email of the stripe customer(Required only for SaaS V1)

Example:`john.doe@example.com`

**stripeCustomerId** string

Stripe customer id if exists(Required only for SaaS V1)

Example:`cus_1QDPY5FpU9DlKp7RQ8BXfywx`

**companyId** stringrequired

**isSaaSV2** booleanrequired

Denotes if it is a saas v2 or v1 sub-account

Example:`true`

**contactId** string

Agency subaccount used for payment provider integration(Required Only for SaaS V2)

Example:`1QDPY5FpU9DlKp7RQ8BXfywx`

**providerLocationId** string

Agency Subaccount ID

Example:`r06mdj4OrrERzYDvsOdh`

**description** string

Description

Example:`Description`

**saasPlanId** string

Required only while pre-configuring saas subscription

Example:`1QDPY5FpU9DlKp7RQ8BXfywx`

**priceId** string

Required only while pre-configuring saas subscription

Example:`price_1QDPY5FpU9DlKp7RQ8BXfywx`

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
curl -L 'https://services.leadconnectorhq.com/saas/enable-saas/:locationId' \-H 'Content-Type: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "stripeAccountId": "acct_1QDPY5FpU9DlKp7RQ8BXfywx",  "name": "John Doe",  "email": "john.doe@example.com",  "stripeCustomerId": "cus_1QDPY5FpU9DlKp7RQ8BXfywx",  "companyId": "string",  "isSaaSV2": true,  "contactId": "1QDPY5FpU9DlKp7RQ8BXfywx",  "providerLocationId": "r06mdj4OrrERzYDvsOdh",  "description": "Description",  "saasPlanId": "1QDPY5FpU9DlKp7RQ8BXfywx",  "priceId": "price_1QDPY5FpU9DlKp7RQ8BXfywx"}'
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
  "stripeAccountId": "acct\_1QDPY5FpU9DlKp7RQ8BXfywx",  "name": "John Doe",  "email": "john.doe@example.com",  "stripeCustomerId": "cus\_1QDPY5FpU9DlKp7RQ8BXfywx",  "companyId": "string",  "isSaaSV2": true,  "contactId": "1QDPY5FpU9DlKp7RQ8BXfywx",  "providerLocationId": "r06mdj4OrrERzYDvsOdh",  "description": "Description",  "saasPlanId": "1QDPY5FpU9DlKp7RQ8BXfywx",  "priceId": "price\_1QDPY5FpU9DlKp7RQ8BXfywx"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
