# https://marketplace.gohighlevel.com/docs/ghl/payments/create-coupon

# Create Coupon

POST 

## https://services.leadconnectorhq.com/payments/coupon

The "Create Coupon" API allows you to create a new promotional coupon with customizable parameters such as discount amount, validity period, usage limits, and applicable products. Use this endpoint to set up promotional offers and special discounts for your customers.

### Requirements

#### Scope(s)

`payments/coupons.write`

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

**altId** stringrequired

Location Id

Example:`BQdAwxa0ky1iK2sstLGJ`

**altType** stringrequired

Alt Type

**Possible values:** \[`location`\]

Example:`location`

**name** stringrequired

Coupon Name

Example:`New Year Sale`

**code** stringrequired

Coupon Code

Example:`LEVELUPDAY2022`

**discountType** stringrequired

Discount Type

**Possible values:** \[`percentage`, `amount`\]

Example:`amount`

**discountValue** numberrequired

Discount Value

Example:`10`

**startDate** stringrequired

Start date in YYYY-MM-DDTHH:mm:ssZ format

Example:`2023-01-01T22:45:00.000Z`

**endDate** string

End date in YYYY-MM-DDTHH:mm:ssZ format

Example:`2023-01-31T22:45:00.000Z`

**usageLimit** number

Max number of times coupon can be used

Example:`10`

**productIds** string\[\]

Product Ids

Example:`["6241712be68f7a98102ba272"]`

**applyToFuturePayments** boolean

Is Coupon applicable on upcoming subscription transactions

**Default value:** `true`

Example:`true`

**applyToFuturePaymentsConfig** object

If coupon is applicable on upcoming subscription transactions, how many months should it be applicable for a subscription

**type** stringrequired

Type of the config

**Possible values:** \[`forever`, `fixed`\]

Example:`forever | fixed`

**duration** numberrequired

Duration the coupon to be applied in a subscription

Example:`5`

**durationType** stringrequired

Type of the duration

**Possible values:** \[`months`\]

Example:`months`

**limitPerCustomer** boolean

Limits whether a coupon can be redeemed only once per customer.

**Default value:** `false`

Example:`true`

## Responses[​](#responses "Direct link to Responses")

*   201
*   422

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**\_id** stringrequired

Unique MongoDB identifier for the coupon

Example:`67f6c132d9485f9dacd5f123`

**usageCount** numberrequired

Number of times the coupon has been used

Example:`12`

**limitPerCustomer** numberrequired

Maximum number of times a customer can use this coupon (0 for unlimited)

Example:`5`

**altId** stringrequired

Location Id

Example:`79t07PzK8Tvf73d12312`

**altType** stringrequired

Type of entity

Example:`location`

**name** stringrequired

Display name of the coupon

Example:`NEWT6`

**code** stringrequired

Redemption code for the coupon

Example:`NEWT6`

**discountType** stringrequired

Type of discount (percentage or amount)

**Possible values:** \[`percentage`, `amount`\]

Example:`percentage`

**discountValue** numberrequired

Value of the discount (percentage or fixed amount)

Example:`25`

**status** stringrequired

Current status of the coupon

**Possible values:** \[`scheduled`, `active`, `expired`\]

Example:`scheduled`

**startDate** stringrequired

Date when the coupon becomes active

Example:`2025-04-30T18:30:00.000Z`

**endDate** string

End date when the coupon expires

Example:`2025-05-30T18:30:00.000Z`

**applyToFuturePayments** booleanrequired

Indicates if the coupon applies to future recurring payments

Example:`true`

**applyToFuturePaymentsConfig** object

Configuration for how the coupon applies to future payments

**type** stringrequired

Type of future payments configuration

**Possible values:** \[`forever`, `fixed`\]

Example:`fixed`

**duration** number

Duration value for fixed type configurations

Example:`3`

**durationType** string

Duration type for fixed configurations (e.g. months)

Example:`months`

**userId** string

User ID associated with the coupon (if applicable)

Example:`q0m15dTLGeiGOXG123123`

**createdAt** stringrequired

Creation timestamp

Example:`2025-04-09T18:49:22.026Z`

**updatedAt** stringrequired

Last update timestamp

Example:`2025-04-09T18:49:22.026Z`

**traceId** stringrequired

Unique identifier for tracing this API request

Example:`c667b18d-8f5e-44cf-a914`

```
{  "_id": "67f6c132d9485f9dacd5f123",  "usageCount": 12,  "limitPerCustomer": 5,  "altId": "79t07PzK8Tvf73d12312",  "altType": "location",  "name": "NEWT6",  "code": "NEWT6",  "discountType": "percentage",  "discountValue": 25,  "status": "scheduled",  "startDate": "2025-04-30T18:30:00.000Z",  "endDate": "2025-05-30T18:30:00.000Z",  "applyToFuturePayments": true,  "applyToFuturePaymentsConfig": {    "type": "fixed",    "duration": 3,    "durationType": "months"  },  "userId": "q0m15dTLGeiGOXG123123",  "createdAt": "2025-04-09T18:49:22.026Z",  "updatedAt": "2025-04-09T18:49:22.026Z",  "traceId": "c667b18d-8f5e-44cf-a914"}
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

**name:** [Authorization](/docs/ghl/payments/payments-api#authentication)**type:** http**scopes:** `payments/coupons.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/payments/coupon' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "altId": "BQdAwxa0ky1iK2sstLGJ",  "altType": "location",  "name": "New Year Sale",  "code": "LEVELUPDAY2022",  "discountType": "amount",  "discountValue": 10,  "startDate": "2023-01-01T22:45:00.000Z",  "endDate": "2023-01-31T22:45:00.000Z",  "usageLimit": 10,  "productIds": [    "6241712be68f7a98102ba272"  ],  "applyToFuturePayments": true,  "applyToFuturePaymentsConfig": [    {      "type": "fixed",      "duration": 5,      "durationType": "months"    },    {      "type": "forever"    }  ],  "limitPerCustomer": true}'
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
  "altId": "BQdAwxa0ky1iK2sstLGJ",  "altType": "location",  "name": "New Year Sale",  "code": "LEVELUPDAY2022",  "discountType": "amount",  "discountValue": 10,  "startDate": "2023-01-01T22:45:00.000Z",  "endDate": "2023-01-31T22:45:00.000Z",  "usageLimit": 10,  "productIds": \[    "6241712be68f7a98102ba272"  \],  "applyToFuturePayments": true,  "applyToFuturePaymentsConfig": \[    {      "type": "fixed",      "duration": 5,      "durationType": "months"    },    {      "type": "forever"    }  \],  "limitPerCustomer": true
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
