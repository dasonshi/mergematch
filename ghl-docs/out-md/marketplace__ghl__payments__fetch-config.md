# https://marketplace.gohighlevel.com/docs/ghl/payments/fetch-config

# Fetch given provider config

GET 

## https://services.leadconnectorhq.com/payments/custom-provider/connect

API for fetching an existing payment config for given location

### Requirements

#### Scope(s)

`payments/custom-provider.readonly`

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

Location id

Example: Lk3nlfk4lxlelVEwcW

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   422

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**name** stringrequired

The name of the custom provider

Example:`Company Paypal Integration`

**description** stringrequired

Description of payment gateway. Shown on the payments integrations page as subtext

Example:`This payment gateway supports payments in India via UPI, Net banking, cards and wallets.`

**paymentsUrl** stringrequired

This url will be loaded in iFrame to start a payment session.

Example:`https://testpayment.paypal.com`

**queryUrl** stringrequired

The url used for querying payments related events. Ex. verify, refund, subscription etc.

Example:`https://testsubscription.paypal.com`

**imageUrl** stringrequired

Public image url for logo of the payment gateway displayed on the payments integrations page.

Example:`https://testsubscription.paypal.com`

**\_id** stringrequired

The unique identifier for the custom provider.

Example:`662a44ad19a2a44d3cd9d749`

**locationId** stringrequired

Location id

Example:`Lk3nlfk4lxlelVEwcW`

**marketplaceAppId** stringrequired

The application id of marketplace

Example:`65f0b217a05c774da7f1efa5`

**paymentProvider** object

Payment provider details.

Example:`{ live: { liveMode: true }, test: { liveMode: false, apiKey: "y5ZQxryRFXZHvUJZdLXXXXXX", publishableKey: "rzp_test_zPRoVMLOa0A9wo" }}`

**deleted** booleanrequired

Whether the config is deleted or not. true represents config is deleted

Example:`true`

**createdAt** date-timerequired

The creation timestamp of the custom provider.

Example:`2023-11-20T10:23:36.515Z`

**updatedAt** date-timerequired

The last update timestamp of the custom provider.

Example:`2024-01-23T09:57:04.846Z`

**traceId** string

Trace id of the custom provider.

Example:`302d2cf4-1ba0-4bf5-bc3b-f8fa76fda58a`

```
{  "name": "Company Paypal Integration",  "description": "This payment gateway supports payments in India via UPI, Net banking, cards and wallets.",  "paymentsUrl": "https://testpayment.paypal.com",  "queryUrl": "https://testsubscription.paypal.com",  "imageUrl": "https://testsubscription.paypal.com",  "_id": "662a44ad19a2a44d3cd9d749",  "locationId": "Lk3nlfk4lxlelVEwcW",  "marketplaceAppId": "65f0b217a05c774da7f1efa5",  "paymentProvider": "{ live: { liveMode: true }, test: { liveMode: false, apiKey: \"y5ZQxryRFXZHvUJZdLXXXXXX\", publishableKey: \"rzp_test_zPRoVMLOa0A9wo\" }}",  "deleted": true,  "createdAt": "2023-11-20T10:23:36.515Z",  "updatedAt": "2024-01-23T09:57:04.846Z",  "traceId": "302d2cf4-1ba0-4bf5-bc3b-f8fa76fda58a"}
```

No such config exists for given locationId and marketplaceAppId

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

**name:** [Authorization](/docs/ghl/payments/payments-api#authentication)**type:** http**scopes:** `payments/custom-provider.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/payments/custom-provider/connect' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
