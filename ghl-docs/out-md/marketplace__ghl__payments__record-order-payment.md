# https://marketplace.gohighlevel.com/docs/ghl/payments/record-order-payment

# Record Order Payment

POST 

## https://services.leadconnectorhq.com/payments/orders/:orderId/record-payment

The "Record Order Payment" API allows to record a payment for an order. Use this endpoint to record payment for an order and update the order status to "Paid".

### Requirements

#### Scope(s)

`payments/orders.collectPayment`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Path Parameters

**orderId** stringrequired

MongoDB Order ID

Example: 5e2d4c8e0e8b4e001c1c4f5d

*   application/json

### Body**required**

**altId** stringrequired

location Id / company Id based on altType

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

Alt Type

**Possible values:** \[`location`\]

Example:`location`

**mode** stringrequired

manual payment method

**Possible values:** \[`cash`, `card`, `cheque`, `bank_transfer`, `other`\]

Example:`card`

**card** object

Details of Card if used for payment

**type** stringrequired

**Possible values:** \[`visa`, `mastercard`, `other`\]

Example:`mastercard`

**last4** stringrequired

Last 4 digit of the card

Example:`1234`

**cheque** object

Details of the Cheque if used for payment

**number** stringrequired

check number

Example:`129-129-129-912`

**notes** string

Any note to be recorded with the transaction

Example:`This was a direct payment`

**amount** number

Amount to be paid against the invoice.

Example:`100`

**meta** object

Meta data to be recorded with the transaction

**isPartialPayment** boolean

Indicates if the order is intended to be a partial payment.

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

Success status of the request

Example:`true`

```
{  "success": true}
```

Order not found

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

**name:** [Authorization](/docs/ghl/payments/payments-api#authentication)**type:** http**scopes:** `payments/orders.collectPayment`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/payments/orders/:orderId/record-payment' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "mode": "card",  "card": {    "type": "mastercard",    "last4": "1234"  },  "cheque": {    "number": "129-129-129-912"  },  "notes": "This was a direct payment",  "amount": 100,  "meta": {},  "isPartialPayment": true}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

orderId — pathrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "mode": "card",  "card": {    "type": "mastercard",    "last4": "1234"  },  "cheque": {    "number": "129-129-129-912"  },  "notes": "This was a direct payment",  "amount": 100,  "meta": {},  "isPartialPayment": true
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
