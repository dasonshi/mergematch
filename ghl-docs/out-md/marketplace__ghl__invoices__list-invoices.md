# https://marketplace.gohighlevel.com/docs/ghl/invoices/list-invoices

# List invoices

GET 

## https://services.leadconnectorhq.com/invoices/

API to get list of invoices

### Requirements

#### Scope(s)

`invoices.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token``Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Query Parameters

**altId** stringrequired

location Id / company Id based on altType

Example: 6578278e879ad2646715ba9c

**altType** stringrequired

**Possible values:** \[`location`\]

Alt Type

Example: location

**status** string

status to be filtered

**startAt** string

startAt in YYYY-MM-DD format

Example: 2023-01-01

**endAt** string

endAt in YYYY-MM-DD format

Example: 2023-01-01

**search** string

To search for an invoice by id / name / email / phoneNo

Example: Alex

**paymentMode** string

**Possible values:** \[`default`, `live`, `test`\]

payment mode

Example: live

**contactId** string

Contact ID for the invoice

Example: AmuzcoPBpgKeccNsFlib

**limit** stringrequired

Limit the number of items to return

Example: 10

**offset** stringrequired

Number of items to skip

Example: 10

**sortField** string

**Possible values:** \[`issueDate`\]

The field on which sorting should be applied

Example: issueDate

**sortOrder** string

**Possible values:** \[`ascend`, `descend`\]

The order of sort which should be applied for the sortField

Example: descend

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

**invoices** object\[\]required

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

**totalSummary** objectrequired

**subTotal** numberrequired

subTotal

Example:`999`

**discount** numberrequired

discount

Example:`0`

**tax** numberrequired

tax

Example:`0`

**remindersConfiguration** object

Reminders Configuration

**reminderExecutionDetailsList** objectrequired

List of reminders

**reminderSettings** objectrequired

Reminder settings

**defaultEmailTemplateId** stringrequired

default template Id of reminder

Example:`dhwjqi2899012990w2u`

**reminders** object\[\]required

List of reminders

*   Array \[
    

**enabled** booleanrequired

Flag indicating if the reminder is enabled or not

Example:`true`

**emailTemplate** stringrequired

Email template to be used for sending reminders

Example:`default`

**smsTemplate** stringrequired

SMS template to be used for sending reminders

Example:`default`

**emailSubject** stringrequired

Subject of the reminder

Example:`Reminder`

**reminderId** stringrequired

Unique identifier for the reminder

Example:`9333e45f-a27d-4659-90e5-76c5ef06d094`

**reminderName** stringrequired

Name of the reminder

Example:`Special Reminder`

**reminderTime** stringrequired

Time condition for the reminder

**Possible values:** \[`before`, `after`\]

Example:`before`

**intervalType** stringrequired

Interval type for the reminder

**Possible values:** \[`yearly`, `monthly`, `weekly`, `daily`, `hourly`, `minutely`, `secondly`\]

Example:`daily`

**maxReminders** numberrequired

Maximum number of reminders that can be sent

Example:`3`

**reminderInvoiceCondition** stringrequired

Condition for sending the reminder

**Possible values:** \[`invoice_sent`, `invoice_overdue`\]

Example:`invoice_sent`

**reminderNumber** numberrequired

frequency gap of the reminder to exeucte

Example:`10`

**startTime** string

Business Hour Start Time

Example:`9:00 AM`

**endTime** string

Business Hour End Time

Example:`5:00 PM`

**timezone** string

Timezone at which reminder will be sent

Example:`businessTZ`

*   \]
    

*   \]
    

**total** numberrequired

Total number of invoices

Example:`100`

```
{  "invoices": [    {      "_id": "6578278e879ad2646715ba9c",      "status": "draft",      "liveMode": false,      "amountPaid": 0,      "altId": "6578278e879ad2646715ba9c",      "altType": "location",      "name": "New Invoice",      "businessDetails": {        "name": "Alex",        "address": {          "addressLine1": "9931 Beechwood",          "city": "St. Houston",          "state": "TX",          "countryCode": "USA",          "postalCode": "559-6993"        },        "phoneNo": "+1-214-559-6993",        "website": "www.example.com"      },      "invoiceNumber": "19",      "currency": "USD",      "contactDetails": {        "id": "c6tZZU0rJBf30ZXx9Gli",        "phoneNo": "+1-214-559-6993",        "email": "alex@example.com",        "customFields": [],        "name": "Alex",        "address": {          "countryCode": "US"        }      },      "issueDate": "2023-01-01",      "dueDate": "2023-01-01",      "discount": {        "type": "percentage",        "value": 0      },      "invoiceItems": [        {          "taxes": [],          "_id": "c6tZZU0rJBf30ZXx9Gli",          "productId": "c6tZZU0rJBf30ZXx9Gli",          "priceId": "c6tZZU0rJBf30ZXx9Gli",          "currency": "USD",          "name": "Macbook Pro",          "qty": 1,          "amount": 999        }      ],      "total": 999,      "title": "INVOICE",      "amountDue": 999,      "createdAt": "2023-12-12T09:27:42.355Z",      "updatedAt": "2023-12-12T09:27:42.355Z",      "automaticTaxesEnabled": true,      "automaticTaxesCalculated": true,      "paymentSchedule": {},      "totalSummary": {        "subTotal": 999,        "discount": 0,        "tax": 0      },      "remindersConfiguration": {        "reminderExecutionDetailsList": {},        "reminderSettings": {          "defaultEmailTemplateId": "dhwjqi2899012990w2u",          "reminders": [            {              "enabled": true,              "emailTemplate": "default",              "smsTemplate": "default",              "emailSubject": "Reminder",              "reminderId": "9333e45f-a27d-4659-90e5-76c5ef06d094",              "reminderName": "Special Reminder",              "reminderTime": "before",              "intervalType": "daily",              "maxReminders": 3,              "reminderInvoiceCondition": "invoice_sent",              "reminderNumber": 10,              "startTime": "9:00 AM",              "endTime": "5:00 PM",              "timezone": "businessTZ"            }          ]        }      }    }  ],  "total": 100}
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

**name:** [Authorization](/docs/ghl/invoices/invoice-api#authentication)**type:** http**scopes:** `invoices.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/invoices/' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

altId — queryrequired

altType — queryrequired

\---location

limit — queryrequired

offset — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

status — query

startAt — query

endAt — query

search — query

paymentMode — query

\---defaultlivetest

contactId — query

sortField — query

\---issueDate

sortOrder — query

\---ascenddescend

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
