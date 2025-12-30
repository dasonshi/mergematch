# https://marketplace.gohighlevel.com/docs/ghl/invoices/update-invoice-late-fees-configuration

# Update invoice late fees configuration

PATCH 

## https://services.leadconnectorhq.com/invoices/:invoiceId/late-fees-configuration

API to update invoice late fees configuration by invoice id

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

### Path Parameters

**invoiceId** stringrequired

Invoice Id

Example: 6578278e879ad2646715ba9c

*   application/json

### Body**required**

**altId** stringrequired

location Id / company Id based on altType

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

Alt Type

**Possible values:** \[`location`\]

Example:`location`

**lateFeesConfiguration** object

late fees configuration

**enable** booleanrequired

Enable late fees

Example:`true`

**value** numberrequired

Late Fees Value

Example:`10`

**type** stringrequired

Late Fees Type

**Possible values:** \[`fixed`, `percentage`\]

Example:`fixed`

**frequency** objectrequired

Late Fees Frequency

**intervalCount** number

Late fees interval count

Example:`10`

**interval** stringrequired

Late fees interval

**Possible values:** \[`minute`, `hour`, `day`, `week`, `month`, `one_time`\]

Example:`day`

**grace** object

Late Fees Grace

**intervalCount** numberrequired

Late fees grace interval count

Example:`10`

**interval** stringrequired

Late fees grace interval

**Possible values:** \[`day`\]

Example:`day`

**maxLateFees** object

Max late fees payable

**type** stringrequired

**Possible values:** \[`fixed`\]

Example:`fixed`

**value** numberrequired

10

Example:`Max late fees to pay`

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

**\_id** stringrequired

Invoice Id

Example:`6578278e879ad2646715ba9c`

**status** stringrequired

Invoice Status

**Possible values:** \[`draft`, `sent`, `payment_processing`, `paid`, `void`, `partially_paid`\]

Example:`draft`

**liveMode** booleanrequired

Live Mode

Example:`false`

**amountPaid** numberrequired

Amount Paid

Example:`0`

**altId** stringrequired

Location Id or Agency Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

**Possible values:** \[`location`\]

**name** stringrequired

Name of the invoice

Example:`New Invoice`

**businessDetails** objectrequired

Business Details

Example:`{"name":"Alex","address":{"addressLine1":"9931 Beechwood","city":"St. Houston","state":"TX","countryCode":"USA","postalCode":"559-6993"},"phoneNo":"+1-214-559-6993","website":"www.example.com"}`

**invoiceNumber** numberrequired

Invoice Number

Example:`19`

**currency** stringrequired

Currency

Example:`USD`

**contactDetails** objectrequired

Contact Details

Example:`{"id":"c6tZZU0rJBf30ZXx9Gli","phoneNo":"+1-214-559-6993","email":"alex@example.com","customFields":[],"name":"Alex","address":{"countryCode":"US"}}`

**issueDate** stringrequired

Issue date in YYYY-MM-DD format

Example:`2023-01-01`

**dueDate** stringrequired

Due date in YYYY-MM-DD format

Example:`2023-01-01`

**discount** object

Discount

Example:`{"type":"percentage","value":0}`

**invoiceItems** string\[\]required

Invoice Items

Example:`[{"taxes":[],"_id":"c6tZZU0rJBf30ZXx9Gli","productId":"c6tZZU0rJBf30ZXx9Gli","priceId":"c6tZZU0rJBf30ZXx9Gli","currency":"USD","name":"Macbook Pro","qty":1,"amount":999}]`

**total** numberrequired

Total Amount

Example:`999`

**title** stringrequired

Title

Example:`INVOICE`

**amountDue** numberrequired

Total Amount Due

Example:`999`

**createdAt** stringrequired

created at

Example:`2023-12-12T09:27:42.355Z`

**updatedAt** stringrequired

updated at

Example:`2023-12-12T09:27:42.355Z`

**automaticTaxesEnabled** boolean

Automatic taxes enabled for the Invoice

Example:`true`

**automaticTaxesCalculated** boolean

Is Automatic taxes calculated for the Invoice items

Example:`true`

**paymentSchedule** object

split invoice into payment schedule summing up to full invoice amount

```
{  "_id": "6578278e879ad2646715ba9c",  "status": "draft",  "liveMode": false,  "amountPaid": 0,  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "name": "New Invoice",  "businessDetails": {    "name": "Alex",    "address": {      "addressLine1": "9931 Beechwood",      "city": "St. Houston",      "state": "TX",      "countryCode": "USA",      "postalCode": "559-6993"    },    "phoneNo": "+1-214-559-6993",    "website": "www.example.com"  },  "invoiceNumber": "19",  "currency": "USD",  "contactDetails": {    "id": "c6tZZU0rJBf30ZXx9Gli",    "phoneNo": "+1-214-559-6993",    "email": "alex@example.com",    "customFields": [],    "name": "Alex",    "address": {      "countryCode": "US"    }  },  "issueDate": "2023-01-01",  "dueDate": "2023-01-01",  "discount": {    "type": "percentage",    "value": 0  },  "invoiceItems": [    {      "taxes": [],      "_id": "c6tZZU0rJBf30ZXx9Gli",      "productId": "c6tZZU0rJBf30ZXx9Gli",      "priceId": "c6tZZU0rJBf30ZXx9Gli",      "currency": "USD",      "name": "Macbook Pro",      "qty": 1,      "amount": 999    }  ],  "total": 999,  "title": "INVOICE",  "amountDue": 999,  "createdAt": "2023-12-12T09:27:42.355Z",  "updatedAt": "2023-12-12T09:27:42.355Z",  "automaticTaxesEnabled": true,  "automaticTaxesCalculated": true,  "paymentSchedule": {}}
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
curl -L -X PATCH 'https://services.leadconnectorhq.com/invoices/:invoiceId/late-fees-configuration' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "lateFeesConfiguration": {    "enable": true,    "value": 10,    "type": "fixed",    "frequency": {      "intervalCount": 10,      "interval": "day"    },    "grace": {      "intervalCount": 10,      "interval": "day"    },    "maxLateFees": {      "type": "fixed",      "value": "Max late fees to pay"    }  }}'
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

invoiceId — pathrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "lateFeesConfiguration": {    "enable": true,    "value": 10,    "type": "fixed",    "frequency": {      "intervalCount": 10,      "interval": "day"    },    "grace": {      "intervalCount": 10,      "interval": "day"    },    "maxLateFees": {      "type": "fixed",      "value": "Max late fees to pay"    }  }
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
