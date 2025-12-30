# https://marketplace.gohighlevel.com/docs/ghl/invoices/update-invoice

# Update invoice

PUT 

## https://services.leadconnectorhq.com/invoices/:invoiceId

API to update invoice by invoice id

### Requirements

#### Scope(s)

`invoices.write`

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

**name** stringrequired

Name to be updated

Example:`New Invoice`

**title** string

Title for the invoice

Example:`INVOICE`

**currency** stringrequired

Currency

Example:`USD`

**description** string

Description

Example:`ABC Corp payments`

**businessDetails** object

Business details which need to be updated

**logoUrl** string

Business Logo URL

Example:`https://example.com/logo.png`

**name** string

Business Name

Example:`ABC Corp.`

**phoneNo** string

Business Phone Number

Example:`+1-214-559-6993`

**address** object

Business Address

**addressLine1** string

Address Line 1

Example:`9931 Beechwood`

**addressLine2** string

Address Line 2

Example:`Beechwood`

**city** string

City

Example:`St. Houston`

**state** string

State

Example:`TX`

**countryCode** string

Country Code

Example:`US`

**postalCode** string

Postal Code

Example:`559-6993`

**website** string

Business Website Link

Example:`wwww.example.com`

**customValues** string\[\]

Custom Values

**invoiceNumber** string

Invoice Number

Example:`1001`

**contactId** string

Id of the contact which you need to send the invoice

Example:`6578278e879ad2646715ba9c`

**contactDetails** object

**id** stringrequired

Contact ID

Example:`6578278e879ad2646715ba9c`

**name** stringrequired

Contact Name

Example:`Alex`

**phoneNo** stringrequired

Contact Phone Number

Example:`+1234567890`

**email** stringrequired

Contact Email

Example:`alex@example.com`

**additionalEmails** object\[\]

Secondary email addresses for the contact to be saved

*   Array \[
    

**email** stringrequired

Example:`alex@example.com`

*   \]
    

**companyName** string

Contact Company Name

Example:`ABC Corp.`

**address** object

**addressLine1** string

Address Line 1

Example:`9931 Beechwood`

**addressLine2** string

Address Line 2

Example:`Beechwood`

**city** string

City

Example:`St. Houston`

**state** string

State

Example:`TX`

**countryCode** string

Country Code

Example:`US`

**postalCode** string

Postal Code

Example:`559-6993`

**customFields** string\[\]

Custom Values

**termsNotes** string

Terms notes, Also supports HTML markups

Example:`<p>This is a default terms.</p>`

**discount** object

**value** number

Discount Value

**Default value:** `0`

Example:`10`

**type** stringrequired

Discount type

**Possible values:** \[`percentage`, `fixed`\]

**Default value:** `percentage`

Example:`percentage`

**validOnProductIds** string\[\]

Product Ids on which discount is applicable

Example:`[ '6579751d56f60276e5bd4154' ]`

**invoiceItems** object\[\]required

*   Array \[
    

**name** stringrequired

Invoice Item Name

Example:`ABC Product`

**description** string

Invoice descriptions

Example:`ABC Corp.`

**productId** string

Product Id

Example:`6578278e879ad2646715ba9c`

**priceId** string

Price Id

Example:`6578278e879ad2646715ba9c`

**currency** stringrequired

Currency

Example:`USD`

**amount** numberrequired

Product amount

Example:`999`

**qty** numberrequired

Product Quantity

Example:`1`

**taxes** object\[\]

Tax

*   Array \[
    

**\_id** stringrequired

**name** stringrequired

**rate** numberrequired

**calculation** string

**Possible values:** \[`exclusive`\]

**description** string

**taxId** string

*   \]
    

**automaticTaxCategoryId** string

Tax category id for calculating automatic tax

Example:`6578278e879ad2646715ba9c`

**isSetupFeeItem** boolean

Setupfee item, only created when 1st invoice of recurring schedule is generated

**type** string

Price type of the item

**Possible values:** \[`one_time`, `recurring`\]

Example:`one_time`

**taxInclusive** boolean

true if item amount is tax inclusive

**Default value:** `false`

Example:`true`

*   \]
    

**automaticTaxesEnabled** boolean

Automatic taxes enabled for the Invoice

Example:`true`

**liveMode** boolean

Payment mode

**issueDate** stringrequired

Issue date in YYYY-MM-DD format

Example:`2023-01-01`

**dueDate** stringrequired

Due date in YYYY-MM-DD format

Example:`2023-01-14`

**paymentSchedule** object

split invoice into payment schedule summing up to full invoice amount

**type** stringrequired

Payment schedule type

**Possible values:** \[`fixed`, `percentage`\]

Example:`percentage`

**schedules** string\[\]required

payment schedule item

**tipsConfiguration** object

tips configuration for the invoice

**tipsPercentage** string\[\]required

Percentage of tips allowed

Example:`[5,10,15]`

**tipsEnabled** booleanrequired

Tips enabled status

Example:`true`

**xeroDetails** object

**invoiceNumberPrefix** string

prefix for invoice number

Example:`INV-`

**paymentMethods** object

Payment Methods for Invoices

**stripe** objectrequired

Payment Method

**enableBankDebitOnly** booleanrequired

Enable Bank Debit Only

Example:`false`

**attachments** object\[\]

attachments for the invoice

*   Array \[
    

**id** stringrequired

Id of the file selected

Example:`6241712be68f7a98102ba272`

**name** stringrequired

Name of the file

Example:`Electronics.pdf`

**url** stringrequired

URL of the file

Example:`https://example.com/digital-delivery`

**type** stringrequired

Type of the file

**size** numberrequired

Size of the file

Example:`10000`

*   \]
    

**miscellaneousCharges** object

miscellaneous charges for the invoice

**charges** array\[\]required

charges for the processing fee

**collectedMiscellaneousCharges** number

collected miscellaneous charges

Example:`10`

**paidCharges** object\[\]

paid miscellaneous charges

*   Array \[
    

**name** stringrequired

name of the processing fee

Example:`Processing Fee`

**charge** numberrequired

charge for the processing fee

Example:`10`

**amount** numberrequired

amount of the processing fee

Example:`10`

**\_id** stringrequired

id of the processing fee

Example:`673d01d7d547648a8dab6211`

*   \]
    

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

**name:** [Authorization](/docs/ghl/invoices/invoice-api#authentication)**type:** http**scopes:** `invoices.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PUT 'https://services.leadconnectorhq.com/invoices/:invoiceId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "name": "New Invoice",  "title": "INVOICE",  "currency": "USD",  "description": "ABC Corp payments",  "businessDetails": {    "name": "Alex",    "address": {      "addressLine1": "9931 Beechwood",      "city": "St. Houston",      "state": "TX",      "countryCode": "USA",      "postalCode": "559-6993"    },    "phoneNo": "+1-214-559-6993",    "website": "www.example.com"  },  "invoiceNumber": "1001",  "contactId": "6578278e879ad2646715ba9c",  "contactDetails": {    "id": "6578278e879ad2646715ba9c",    "name": "Alex",    "phoneNo": "+1234567890",    "email": "alex@example.com",    "additionalEmails": [      {        "email": "alex@example.com"      }    ],    "companyName": "ABC Corp.",    "address": {      "addressLine1": "9931 Beechwood",      "addressLine2": "Beechwood",      "city": "St. Houston",      "state": "TX",      "countryCode": "US",      "postalCode": "559-6993"    },    "customFields": [      "string"    ]  },  "termsNotes": "<p>This is a default terms.</p>",  "discount": {    "value": 10,    "type": "percentage",    "validOnProductIds": "[ '\''6579751d56f60276e5bd4154'\'' ]"  },  "invoiceItems": [    {      "name": "ABC Product",      "description": "ABC Corp.",      "productId": "6578278e879ad2646715ba9c",      "priceId": "6578278e879ad2646715ba9c",      "currency": "USD",      "amount": 999,      "qty": 1,      "taxes": [        {          "_id": "string",          "name": "string",          "rate": 0,          "calculation": "exclusive",          "description": "string",          "taxId": "string"        }      ],      "automaticTaxCategoryId": "6578278e879ad2646715ba9c",      "isSetupFeeItem": true,      "type": "one_time",      "taxInclusive": true    }  ],  "automaticTaxesEnabled": true,  "liveMode": true,  "issueDate": "2023-01-01",  "dueDate": "2023-01-14",  "paymentSchedule": {    "type": "percentage",    "schedules": [      "string"    ]  },  "tipsConfiguration": {    "tipsPercentage": [      5,      10,      15    ],    "tipsEnabled": true  },  "xeroDetails": {},  "invoiceNumberPrefix": "INV-",  "paymentMethods": {    "stripe": {      "enableBankDebitOnly": false    }  },  "attachments": [    {      "id": "6241712be68f7a98102ba272",      "name": "Electronics.pdf",      "url": "https://example.com/digital-delivery",      "type": "string",      "size": 10000    }  ],  "miscellaneousCharges": {    "charges": [      [        null      ]    ],    "collectedMiscellaneousCharges": 10,    "paidCharges": [      {        "name": "Processing Fee",        "charge": 10,        "amount": 10,        "_id": "673d01d7d547648a8dab6211"      }    ]  }}'
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
  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "name": "New Invoice",  "title": "INVOICE",  "currency": "USD",  "description": "ABC Corp payments",  "businessDetails": {    "name": "Alex",    "address": {      "addressLine1": "9931 Beechwood",      "city": "St. Houston",      "state": "TX",      "countryCode": "USA",      "postalCode": "559-6993"    },    "phoneNo": "+1-214-559-6993",    "website": "www.example.com"  },  "invoiceNumber": "1001",  "contactId": "6578278e879ad2646715ba9c",  "contactDetails": {    "id": "6578278e879ad2646715ba9c",    "name": "Alex",    "phoneNo": "+1234567890",    "email": "alex@example.com",    "additionalEmails": \[      {        "email": "alex@example.com"      }    \],    "companyName": "ABC Corp.",    "address": {      "addressLine1": "9931 Beechwood",      "addressLine2": "Beechwood",      "city": "St. Houston",      "state": "TX",      "countryCode": "US",      "postalCode": "559-6993"    },    "customFields": \[      "string"    \]  },  "termsNotes": "<p>This is a default terms.</p>",  "discount": {    "value": 10,    "type": "percentage",    "validOnProductIds": "\[ '6579751d56f60276e5bd4154' \]"  },  "invoiceItems": \[    {      "name": "ABC Product",      "description": "ABC Corp.",      "productId": "6578278e879ad2646715ba9c",      "priceId": "6578278e879ad2646715ba9c",      "currency": "USD",      "amount": 999,      "qty": 1,      "taxes": \[        {          "\_id": "string",          "name": "string",          "rate": 0,          "calculation": "exclusive",          "description": "string",          "taxId": "string"        }      \],      "automaticTaxCategoryId": "6578278e879ad2646715ba9c",      "isSetupFeeItem": true,      "type": "one\_time",      "taxInclusive": true    }  \],  "automaticTaxesEnabled": true,  "liveMode": true,  "issueDate": "2023-01-01",  "dueDate": "2023-01-14",  "paymentSchedule": {    "type": "percentage",    "schedules": \[      "string"    \]  },  "tipsConfiguration": {    "tipsPercentage": \[      5,      10,      15    \],    "tipsEnabled": true  },  "xeroDetails": {},  "invoiceNumberPrefix": "INV-",  "paymentMethods": {    "stripe": {      "enableBankDebitOnly": false    }  },  "attachments": \[    {      "id": "6241712be68f7a98102ba272",      "name": "Electronics.pdf",      "url": "https://example.com/digital-delivery",      "type": "string",      "size": 10000    }  \],  "miscellaneousCharges": {    "charges": \[      \[        null      \]    \],    "collectedMiscellaneousCharges": 10,    "paidCharges": \[      {        "name": "Processing Fee",        "charge": 10,        "amount": 10,        "\_id": "673d01d7d547648a8dab6211"      }    \]  }
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
