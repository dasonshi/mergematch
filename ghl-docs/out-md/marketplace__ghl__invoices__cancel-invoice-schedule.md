# https://marketplace.gohighlevel.com/docs/ghl/invoices/cancel-invoice-schedule

# Cancel an scheduled invoice

POST 

## https://services.leadconnectorhq.com/invoices/schedule/:scheduleId/cancel

API to cancel a scheduled invoice by schedule id

### Requirements

#### Scope(s)

`invoices/schedule.write`

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

**scheduleId** stringrequired

Schedule Id

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

Schedule Id

Example:`6578278e879ad2646715ba9c`

**status** objectrequired

Schedule Status

Example:`draft`

**liveMode** booleanrequired

Live Mode

Example:`false`

**altId** stringrequired

Location Id or Agency Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

**Possible values:** \[`location`\]

**name** stringrequired

Name of the invoice

Example:`New Invoice`

**schedule** object

**executeAt** string

**rrule** object

**intervalType** stringrequired

**Possible values:** \[`yearly`, `monthly`, `weekly`, `daily`, `hourly`, `minutely`, `secondly`\]

Example:`monthly`

**interval** numberrequired

Example:`2`

**startDate** stringrequired

Start date in YYYY-MM-DD format

Example:`2023-01-01`

**startTime** string

Start time in HH:mm:ss format

Example:`20:45:00`

**endDate** string

End date in YYYY-MM-DD format

Example:`2029-11-01`

**endTime** string

End time in HH:mm:ss format

Example:`18:45:00`

**dayOfMonth** number

\-1, 1, 2, 3, ..., 27, 28

Example:`15`

**dayOfWeek** string

**Possible values:** \[`mo`, `tu`, `we`, `th`, `fr`, `sa`, `su`\]

Example:`mo`

**numOfWeek** number

\-1, 1, 2, 3, 4

Example:`-1`

**monthOfYear** string

**Possible values:** \[`jan`, `feb`, `mar`, `apr`, `may`, `jun`, `jul`, `aug`, `sep`, `oct`, `nov`, `dec`\]

Example:`jan`

**count** number

Max number of task executions

Example:`10`

**daysBefore** number

Execute task number of days before

Example:`5`

**useStartAsPrimaryUserAccepted** boolean

Start as primary user accepted date

Example:`true`

**endType** string

End type like after, by, count

Example:`by`

**invoices** object\[\]required

List of invoices

*   Array \[
    

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

*   \]
    

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

**contactDetails** object

Contact Details

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

**total** numberrequired

Total Amount

Example:`999`

**title** stringrequired

Title

Example:`INVOICE`

**termsNotes** stringrequired

Terms notes

Example:`Confidential`

**compiledTermsNotes** stringrequired

Compiled terms notes

Example:`Confidential`

**createdAt** stringrequired

created at

Example:`2023-12-12T09:27:42.355Z`

**updatedAt** stringrequired

updated at

Example:`2023-12-12T09:27:42.355Z`

```
{  "_id": "6578278e879ad2646715ba9c",  "status": "draft",  "liveMode": false,  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "name": "New Invoice",  "schedule": {    "executeAt": "string",    "rrule": {      "intervalType": "monthly",      "interval": 2,      "startDate": "2023-01-01",      "startTime": "20:45:00",      "endDate": "2029-11-01",      "endTime": "18:45:00",      "dayOfMonth": 15,      "dayOfWeek": "mo",      "numOfWeek": -1,      "monthOfYear": "jan",      "count": 10,      "daysBefore": 5,      "useStartAsPrimaryUserAccepted": true,      "endType": "by"    }  },  "invoices": [    {      "_id": "6578278e879ad2646715ba9c",      "status": "draft",      "liveMode": false,      "amountPaid": 0,      "altId": "6578278e879ad2646715ba9c",      "altType": "location",      "name": "New Invoice",      "businessDetails": {        "name": "Alex",        "address": {          "addressLine1": "9931 Beechwood",          "city": "St. Houston",          "state": "TX",          "countryCode": "USA",          "postalCode": "559-6993"        },        "phoneNo": "+1-214-559-6993",        "website": "www.example.com"      },      "invoiceNumber": "19",      "currency": "USD",      "contactDetails": {        "id": "c6tZZU0rJBf30ZXx9Gli",        "phoneNo": "+1-214-559-6993",        "email": "alex@example.com",        "customFields": [],        "name": "Alex",        "address": {          "countryCode": "US"        }      },      "issueDate": "2023-01-01",      "dueDate": "2023-01-01",      "discount": {        "type": "percentage",        "value": 0      },      "invoiceItems": [        {          "taxes": [],          "_id": "c6tZZU0rJBf30ZXx9Gli",          "productId": "c6tZZU0rJBf30ZXx9Gli",          "priceId": "c6tZZU0rJBf30ZXx9Gli",          "currency": "USD",          "name": "Macbook Pro",          "qty": 1,          "amount": 999        }      ],      "total": 999,      "title": "INVOICE",      "amountDue": 999,      "createdAt": "2023-12-12T09:27:42.355Z",      "updatedAt": "2023-12-12T09:27:42.355Z",      "automaticTaxesEnabled": true,      "automaticTaxesCalculated": true,      "paymentSchedule": {}    }  ],  "businessDetails": {    "name": "Alex",    "address": {      "addressLine1": "9931 Beechwood",      "city": "St. Houston",      "state": "TX",      "countryCode": "USA",      "postalCode": "559-6993"    },    "phoneNo": "+1-214-559-6993",    "website": "www.example.com"  },  "currency": "USD",  "contactDetails": {    "id": "c6tZZU0rJBf30ZXx9Gli",    "phoneNo": "+1-214-559-6993",    "email": "alex@example.com",    "customFields": [],    "name": "Alex",    "address": {      "countryCode": "US"    }  },  "discount": {    "type": "percentage",    "value": 0  },  "items": [    {      "taxes": [],      "_id": "c6tZZU0rJBf30ZXx9Gli",      "productId": "c6tZZU0rJBf30ZXx9Gli",      "priceId": "c6tZZU0rJBf30ZXx9Gli",      "currency": "USD",      "name": "Macbook Pro",      "qty": 1,      "amount": 999    }  ],  "total": 999,  "title": "INVOICE",  "termsNotes": "Confidential",  "compiledTermsNotes": "Confidential",  "createdAt": "2023-12-12T09:27:42.355Z",  "updatedAt": "2023-12-12T09:27:42.355Z"}
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

**name:** [Authorization](/docs/ghl/invoices/invoice-api#authentication)**type:** http**scopes:** `invoices/schedule.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/invoices/schedule/:scheduleId/cancel' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "altId": "6578278e879ad2646715ba9c",  "altType": "location"}'
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

scheduleId — pathrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "altId": "6578278e879ad2646715ba9c",  "altType": "location"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
