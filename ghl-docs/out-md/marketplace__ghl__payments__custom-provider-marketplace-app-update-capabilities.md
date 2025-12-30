# https://marketplace.gohighlevel.com/docs/ghl/payments/custom-provider-marketplace-app-update-capabilities

# Custom-provider marketplace app update capabilities

PUT 

## https://services.leadconnectorhq.com/payments/custom-provider/capabilities

Toggle capabilities for the marketplace app tied to the OAuth client

### Requirements

#### Scope(s)

`payments/custom-provider.write`

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

**supportsSubscriptionSchedules** booleanrequired

Whether the marketplace app supports subscription schedules or not

Example:`true`

**companyId** string

Company id. Mandatory if locationId is not provided

Example:`Yjnwuduw83e8x30sm0`

**locationId** string

Location / Sub-account id. Mandatory if companyId is not provided

Example:`Yjnwuduw83e8x30sm0`

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

**success** booleanrequired

Whether the custom provider capabilities are updated or not. true represents capabilities are updated

Example:`true`

```
{  "success": "true"}
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

**name:** [Authorization](/docs/ghl/payments/payments-api#authentication)**type:** http**scopes:** `payments/custom-provider.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PUT 'https://services.leadconnectorhq.com/payments/custom-provider/capabilities' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "supportsSubscriptionSchedules": true,  "companyId": "Yjnwuduw83e8x30sm0",  "locationId": "Yjnwuduw83e8x30sm0"}'
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
  "supportsSubscriptionSchedules": true,  "companyId": "Yjnwuduw83e8x30sm0",  "locationId": "Yjnwuduw83e8x30sm0"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
