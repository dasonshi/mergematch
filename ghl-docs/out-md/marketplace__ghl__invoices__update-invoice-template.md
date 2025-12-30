# https://marketplace.gohighlevel.com/docs/ghl/invoices/update-invoice-template

# Update template

PUT 

## https://services.leadconnectorhq.com/invoices/template/:templateId

API to update an template by template id

### Requirements

#### Scope(s)

`invoices/template.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token``Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Authorization** stringrequired

Access Token

Example: Bearer 9c48df2694a849b6089f9d0d3513efe

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Path Parameters

**templateId** stringrequired

Template Id

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

**internal** boolean

**name** stringrequired

Name of the template

Example:`New Template`

**businessDetails** objectrequired

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

**currency** stringrequired

**items** object\[\]required

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

**termsNotes** string

**title** string

Template title

Example:`New Template`

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

Template Id

Example:`6578278e879ad2646715ba9c`

**altId** stringrequired

Location Id or Agency Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

**Possible values:** \[`location`\]

**name** stringrequired

Name of the Template

Example:`New Template`

**businessDetails** object

Business Details

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

**currency** stringrequired

Currency

Example:`USD`

**discount** object

Discount

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

**items** string\[\]required

Invoice Items

Example:`[{"taxes":[],"_id":"c6tZZU0rJBf30ZXx9Gli","productId":"c6tZZU0rJBf30ZXx9Gli","priceId":"c6tZZU0rJBf30ZXx9Gli","currency":"USD","name":"Macbook Pro","qty":1,"amount":999}]`

**invoiceNumberPrefix** string

prefix for invoice number

Example:`INV-`

**total** numberrequired

Total Amount

Example:`999`

**createdAt** stringrequired

created at

Example:`2023-12-12T09:27:42.355Z`

**updatedAt** stringrequired

updated at

Example:`2023-12-12T09:27:42.355Z`

```
{  "_id": "6578278e879ad2646715ba9c",  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "name": "New Template",  "businessDetails": {    "name": "Alex",    "address": {      "addressLine1": "9931 Beechwood",      "city": "St. Houston",      "state": "TX",      "countryCode": "USA",      "postalCode": "559-6993"    },    "phoneNo": "+1-214-559-6993",    "website": "www.example.com"  },  "currency": "USD",  "discount": {    "type": "percentage",    "value": 0  },  "items": [    {      "taxes": [],      "_id": "c6tZZU0rJBf30ZXx9Gli",      "productId": "c6tZZU0rJBf30ZXx9Gli",      "priceId": "c6tZZU0rJBf30ZXx9Gli",      "currency": "USD",      "name": "Macbook Pro",      "qty": 1,      "amount": 999    }  ],  "invoiceNumberPrefix": "INV-",  "total": 999,  "createdAt": "2023-12-12T09:27:42.355Z",  "updatedAt": "2023-12-12T09:27:42.355Z"}
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

**name:** [Authorization](/docs/ghl/invoices/invoice-api#authentication)**type:** http**scopes:** `invoices/template.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PUT 'https://services.leadconnectorhq.com/invoices/template/:templateId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "internal": true,  "name": "New Template",  "businessDetails": {    "logoUrl": "https://example.com/logo.png",    "name": "ABC Corp.",    "phoneNo": "+1-214-559-6993",    "address": "9931 Beechwood, TX",    "website": "wwww.example.com",    "customValues": [      "string"    ]  },  "currency": "string",  "items": [    {      "name": "ABC Product",      "description": "ABC Corp.",      "productId": "6578278e879ad2646715ba9c",      "priceId": "6578278e879ad2646715ba9c",      "currency": "USD",      "amount": 999,      "qty": 1,      "taxes": [        {          "_id": "string",          "name": "string",          "rate": 0,          "calculation": "exclusive",          "description": "string",          "taxId": "string"        }      ],      "automaticTaxCategoryId": "6578278e879ad2646715ba9c",      "isSetupFeeItem": true,      "type": "one_time",      "taxInclusive": true    }  ],  "discount": {    "value": 10,    "type": "percentage",    "validOnProductIds": "[ '\''6579751d56f60276e5bd4154'\'' ]"  },  "termsNotes": "string",  "title": "New Template",  "miscellaneousCharges": {    "charges": [      [        null      ]    ],    "collectedMiscellaneousCharges": 10,    "paidCharges": [      {        "name": "Processing Fee",        "charge": 10,        "amount": 10,        "_id": "673d01d7d547648a8dab6211"      }    ]  }}'
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

templateId — pathrequired

Authorization — headerrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "internal": true,  "name": "New Template",  "businessDetails": {    "logoUrl": "https://example.com/logo.png",    "name": "ABC Corp.",    "phoneNo": "+1-214-559-6993",    "address": "9931 Beechwood, TX",    "website": "wwww.example.com",    "customValues": \[      "string"    \]  },  "currency": "string",  "items": \[    {      "name": "ABC Product",      "description": "ABC Corp.",      "productId": "6578278e879ad2646715ba9c",      "priceId": "6578278e879ad2646715ba9c",      "currency": "USD",      "amount": 999,      "qty": 1,      "taxes": \[        {          "\_id": "string",          "name": "string",          "rate": 0,          "calculation": "exclusive",          "description": "string",          "taxId": "string"        }      \],      "automaticTaxCategoryId": "6578278e879ad2646715ba9c",      "isSetupFeeItem": true,      "type": "one\_time",      "taxInclusive": true    }  \],  "discount": {    "value": 10,    "type": "percentage",    "validOnProductIds": "\[ '6579751d56f60276e5bd4154' \]"  },  "termsNotes": "string",  "title": "New Template",  "miscellaneousCharges": {    "charges": \[      \[        null      \]    \],    "collectedMiscellaneousCharges": 10,    "paidCharges": \[      {        "name": "Processing Fee",        "charge": 10,        "amount": 10,        "\_id": "673d01d7d547648a8dab6211"      }    \]  }
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
