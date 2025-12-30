# https://marketplace.gohighlevel.com/docs/ghl/invoices/create-new-estimate

# Create New Estimate

POST 

## https://services.leadconnectorhq.com/invoices/estimate

Create a new estimate with the provided details

### Requirements

#### Scope(s)

`invoices/estimate.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token``Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

*   application/json

### Body**required**

**altId** stringrequired

Location Id or Agency Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

**Possible values:** \[`location`\]

**name** stringrequired

Estimate Name

Example:`Home Service Estimate`

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

Currency code

Example:`USD`

**items** object\[\]required

An array of items for the estimate.

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
    

**liveMode** boolean

livemode for estimate

**Default value:** `true`

Example:`true`

**discount** objectrequired

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

Terms notes, Also supports HTML markups

Example:`<p>This is a default terms.</p>`

**title** string

Title for the estimate

Example:`ESTIMATE`

**contactDetails** object

Contact information to send the estimate to

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

**estimateNumber** number

Estimate Number, if not specified will take in the next valid estimate number

Example:`1001`

**issueDate** string

issue date estimate

Example:`2024-08-07`

**expiryDate** string

expiry date estimate

Example:`2024-08-10`

**sentTo** object

Email and sent to details for the estimate

**email** string\[\]required

Email Address

Example:`["alex@example.com"]`

**emailCc** string\[\]

cc to be kept in any sent out emails

Example:`["alex@example.com"]`

**emailBcc** string\[\]

bcc to be kept in any sent out emails

Example:`["alex@example.com"]`

**phoneNo** string\[\]

Contact Phone Number

Example:`["+1-214-559-6993"]`

**automaticTaxesEnabled** boolean

Automatic taxes enabled for the Estimate

**Default value:** `false`

Example:`true`

**meta** object

Meta data for the estimate

Example:`{"key":"value"}`

**sendEstimateDetails** object

When sending estimate directly while saving

**altId** stringrequired

Location Id or Agency Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

**Possible values:** \[`location`\]

**action** stringrequired

**Possible values:** \[`sms_and_email`, `send_manually`, `email`, `sms`\]

**liveMode** booleanrequired

livemode for estimate

Example:`true`

**userId** stringrequired

Please ensure that the UserId corresponds to an authorized personnel, either by an employee ID or agency ID, to access this location. This account will serve as the primary channel for all future communications and updates.

Example:`6578278e879ad2646715ba9c`

**sentFrom** object

sender details for invoice, valid only if invoice is not sent manually

**fromName** string

Sender name to be used while sending invoice

Example:`Alex`

**fromEmail** string

Email id to be used while sending out invoices

Example:`alex@example.com`

**estimateName** string

estimate name

Example:`Estimate`

**frequencySettings** object

frequency settings for the estimate

**enabled** booleanrequired

enabled for the frequency settings

Example:`true`

**schedule** objectrequired

schedule setting for the estimate

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

**estimateNumberPrefix** string

Prefix for the estimate number

**Default value:** `EST-`

Example:`EST-`

**userId** string

User Id

Example:`6578278e879ad2646715ba9c`

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
    

**autoInvoice** object

Auto invoice for the estimate

**enabled** booleanrequired

Enable Auto Invoice

Example:`true`

**directPayments** boolean

Direct Payments

Example:`true`

**miscellaneousCharges** object

miscellaneous charges for the estimate

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
    

**paymentScheduleConfig** object

Payment Schedule Config for the estimate

**type** stringrequired

Payment Schedule Type

**Possible values:** \[`fixed`, `percentage`\]

Example:`fixed`

**dateConfig** objectrequired

Due date type configuration

**depositDateType** stringrequired

Deposit date type

**Possible values:** \[`estimate_accepted`, `custom`\]

Example:`estimate_accepted`

**scheduleDateType** stringrequired

Payment Schedule Date Type

**Possible values:** \[`regular_interval`, `custom`\]

Example:`regular_interval`

**schedules** array\[\]required

Payment Schedule Items

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   422

Created

*   application/json

*   Schema
*   Example (auto)

**Schema**

**altId** stringrequired

Location Id or Agency Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

**Possible values:** \[`location`\]

**\_id** stringrequired

Unique identifier

Example:`67ac9a51106ee8311e911XXXX`

**liveMode** booleanrequired

Indicates if it is in live mode

Example:`true`

**deleted** booleanrequired

Indicates if deleted

Example:`false`

**name** stringrequired

Name

Example:`Estimate Name`

**currency** stringrequired

Currency code

Example:`USD`

**businessDetails** objectrequired

Business details associated with the estimate

Example:`{"logoUrl":"your_image-url","name":"Business name","address":{"addressLine1":"address line 1","city":"Test City","state":"State Name","countryCode":"US","postalCode":"12345"},"phoneNo":"+1 1234567890","website":"www.example.com","customValues":[{"name":"Test","fieldKey":"{{custom_values.test}}","id":"5DYTWoiQvWiIJZXX44XXX","value":"Test's Custom Value"}]}`

**items** array\[\]required

An array of items

Example:`[{"taxes":[],"taxInclusive":false,"_id":"67ac9a51106ee8311e911XXXX","description":"<p>Futuristic anti-gravity racing</p>","currency":"USD","productId":"67ac9a51106ee8311e911XXXX","priceId":"67ac9a51106ee8311e911XXXX","amount":9.99,"qty":1,"name":"TEST","type":"one_time"},{"taxes":[{"_id":"67ac9a51106ee8311e911XXXX","name":"TaxTwo","rate":8.5,"calculation":"exclusive"}],"taxInclusive":true,"_id":"67ac9a51106ee8311e911XXXX","productId":"67ac9a51106ee8311e911XXXX","priceId":"67ac9a51106ee8311e911XXXX","currency":"USD","name":"TEST2","qty":1,"amount":500,"description":"","type":"recurring"}]`

**discount** object

Discount details for the estimate template

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

**title** string

Title

Example:`ESTIMATE`

**estimateNumberPrefix** string

Estimate number prefix

Example:`EST-`

**attachments** object\[\]

Attachments

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
    

**updatedBy** string

User Id of who last updated

Example:`3HIpOF9NIc5ltriQXXXX`

**total** numberrequired

Total amount

Example:`1222.03`

**createdAt** date-timerequired

Timestamp when created

Example:`2025-02-12T13:17:47.416Z`

**updatedAt** date-timerequired

Timestamp when last updated

Example:`2025-02-12T13:17:47.416Z`

**\_\_v** numberrequired

Version number

Example:`0`

**automaticTaxesEnabled** booleanrequired

Indicates if automatic taxes are enabled for this estimate

Example:`false`

**termsNotes** string

Terms and conditions for the estimate, supports HTML markup

Example:`<p>All services are subject to availability.</p>`

**companyId** stringrequired

Company identifier associated with the estimate

Example:`COMP12345`

**contactDetails** objectrequired

Contact details for the estimate

Example:`{"id":"jvzfKTNdE7OYXXXXXX","name":"Contact Name","phoneNo":"+911111111114","email":"email@test.com","address":{"countryCode":"US"}}`

**issueDate** date-timerequired

Date when the estimate was issued

Example:`2023-06-15T00:00:00.000Z`

**expiryDate** date-timerequired

Date when the estimate expires

Example:`2023-07-15T00:00:00.000Z`

**sentBy** string

User who sent the estimate

Example:`user@example.com`

**automaticTaxesCalculated** booleanrequired

Indicates if automatic taxes were calculated

Example:`true`

**meta** objectrequired

Additional metadata associated with the estimate

Example:`{"key":"value"}`

**estimateActionHistory** string\[\]required

History of actions taken on the estimate

Example:`[{"action":"Created","timestamp":"2023-06-15T10:00:00.000Z"}]`

**sentTo** objectrequired

Recipient details for the estimate

Example:`{"email":["test@example.com"],"phoneNo":["+1 99444444444"]}`

**frequencySettings** object

Frequency settings for recurring estimates

**enabled** booleanrequired

enabled for the frequency settings

Example:`true`

**schedule** objectrequired

schedule setting for the estimate

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

**lastVisitedAt** date-timerequired

Timestamp when the estimate was last visited

Example:`2023-06-20T08:30:00.000Z`

**totalamountInUSD** numberrequired

Total amount in USD

Example:`1500.75`

**autoInvoice** object

Auto-invoice settings for the estimate

Example:`{"enabled":true,"directPayments":false}`

**traceId** stringrequired

Trace ID for logging and debugging

Example:`010c7a01-857f-4619-970d-xyxyxyxy`

```
{  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "_id": "67ac9a51106ee8311e911XXXX",  "liveMode": true,  "deleted": false,  "name": "Estimate Name",  "currency": "USD",  "businessDetails": {    "logoUrl": "your_image-url",    "name": "Business name",    "address": {      "addressLine1": "address line 1",      "city": "Test City",      "state": "State Name",      "countryCode": "US",      "postalCode": "12345"    },    "phoneNo": "+1 1234567890",    "website": "www.example.com",    "customValues": [      {        "name": "Test",        "fieldKey": "{{custom_values.test}}",        "id": "5DYTWoiQvWiIJZXX44XXX",        "value": "Test's Custom Value"      }    ]  },  "items": [    {      "taxes": [],      "taxInclusive": false,      "_id": "67ac9a51106ee8311e911XXXX",      "description": "<p>Futuristic anti-gravity racing</p>",      "currency": "USD",      "productId": "67ac9a51106ee8311e911XXXX",      "priceId": "67ac9a51106ee8311e911XXXX",      "amount": 9.99,      "qty": 1,      "name": "TEST",      "type": "one_time"    },    {      "taxes": [        {          "_id": "67ac9a51106ee8311e911XXXX",          "name": "TaxTwo",          "rate": 8.5,          "calculation": "exclusive"        }      ],      "taxInclusive": true,      "_id": "67ac9a51106ee8311e911XXXX",      "productId": "67ac9a51106ee8311e911XXXX",      "priceId": "67ac9a51106ee8311e911XXXX",      "currency": "USD",      "name": "TEST2",      "qty": 1,      "amount": 500,      "description": "",      "type": "recurring"    }  ],  "discount": {    "type": "percentage",    "value": 0  },  "title": "ESTIMATE",  "estimateNumberPrefix": "EST-",  "attachments": [    {      "id": "6241712be68f7a98102ba272",      "name": "Electronics.pdf",      "url": "https://example.com/digital-delivery",      "type": "string",      "size": 10000    }  ],  "updatedBy": "3HIpOF9NIc5ltriQXXXX",  "total": 1222.03,  "createdAt": "2025-02-12T13:17:47.416Z",  "updatedAt": "2025-02-12T13:17:47.416Z",  "__v": 0,  "automaticTaxesEnabled": false,  "termsNotes": "<p>All services are subject to availability.</p>",  "companyId": "COMP12345",  "contactDetails": {    "id": "jvzfKTNdE7OYXXXXXX",    "name": "Contact Name",    "phoneNo": "+911111111114",    "email": "email@test.com",    "address": {      "countryCode": "US"    }  },  "issueDate": "2023-06-15T00:00:00.000Z",  "expiryDate": "2023-07-15T00:00:00.000Z",  "sentBy": "user@example.com",  "automaticTaxesCalculated": true,  "meta": {    "key": "value"  },  "estimateActionHistory": [    {      "action": "Created",      "timestamp": "2023-06-15T10:00:00.000Z"    }  ],  "sentTo": {    "email": [      "test@example.com"    ],    "phoneNo": [      "+1 99444444444"    ]  },  "frequencySettings": {    "enabled": true,    "schedule": {      "executeAt": "string",      "rrule": {        "intervalType": "monthly",        "interval": 2,        "startDate": "2023-01-01",        "startTime": "20:45:00",        "endDate": "2029-11-01",        "endTime": "18:45:00",        "dayOfMonth": 15,        "dayOfWeek": "mo",        "numOfWeek": -1,        "monthOfYear": "jan",        "count": 10,        "daysBefore": 5,        "useStartAsPrimaryUserAccepted": true,        "endType": "by"      }    }  },  "lastVisitedAt": "2023-06-20T08:30:00.000Z",  "totalamountInUSD": 1500.75,  "autoInvoice": {    "enabled": true,    "directPayments": false  },  "traceId": "010c7a01-857f-4619-970d-xyxyxyxy"}
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

**name:** [Authorization](/docs/ghl/invoices/invoice-api#authentication)**type:** http**scopes:** `invoices/estimate.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/invoices/estimate' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "name": "Home Service Estimate",  "businessDetails": {    "logoUrl": "https://example.com/logo.png",    "name": "ABC Corp.",    "phoneNo": "+1-214-559-6993",    "address": "9931 Beechwood, TX",    "website": "wwww.example.com",    "customValues": [      "string"    ]  },  "currency": "USD",  "items": [    {      "name": "ABC Product",      "description": "ABC Corp.",      "productId": "6578278e879ad2646715ba9c",      "priceId": "6578278e879ad2646715ba9c",      "currency": "USD",      "amount": 999,      "qty": 1,      "taxes": [        {          "_id": "string",          "name": "string",          "rate": 0,          "calculation": "exclusive",          "description": "string",          "taxId": "string"        }      ],      "automaticTaxCategoryId": "6578278e879ad2646715ba9c",      "isSetupFeeItem": true,      "type": "one_time",      "taxInclusive": true    }  ],  "liveMode": true,  "discount": {    "value": 10,    "type": "percentage",    "validOnProductIds": "[ '\''6579751d56f60276e5bd4154'\'' ]"  },  "termsNotes": "<p>This is a default terms.</p>",  "title": "ESTIMATE",  "contactDetails": {    "id": "6578278e879ad2646715ba9c",    "name": "Alex",    "phoneNo": "+1234567890",    "email": "alex@example.com",    "additionalEmails": [      {        "email": "alex@example.com"      }    ],    "companyName": "ABC Corp.",    "address": {      "addressLine1": "9931 Beechwood",      "addressLine2": "Beechwood",      "city": "St. Houston",      "state": "TX",      "countryCode": "US",      "postalCode": "559-6993"    },    "customFields": [      "string"    ]  },  "estimateNumber": 1001,  "issueDate": "2024-08-07",  "expiryDate": "2024-08-10",  "sentTo": {    "email": [      "alex@example.com"    ],    "emailCc": [      "alex@example.com"    ],    "emailBcc": [      "alex@example.com"    ],    "phoneNo": [      "+1-214-559-6993"    ]  },  "automaticTaxesEnabled": true,  "meta": {    "key": "value"  },  "sendEstimateDetails": {    "altId": "6578278e879ad2646715ba9c",    "altType": "location",    "action": "sms_and_email",    "liveMode": true,    "userId": "6578278e879ad2646715ba9c",    "sentFrom": {      "fromName": "Alex",      "fromEmail": "alex@example.com"    },    "estimateName": "Estimate"  },  "frequencySettings": {    "enabled": true,    "schedule": {      "executeAt": "string",      "rrule": {        "intervalType": "monthly",        "interval": 2,        "startDate": "2023-01-01",        "startTime": "20:45:00",        "endDate": "2029-11-01",        "endTime": "18:45:00",        "dayOfMonth": 15,        "dayOfWeek": "mo",        "numOfWeek": -1,        "monthOfYear": "jan",        "count": 10,        "daysBefore": 5,        "useStartAsPrimaryUserAccepted": true,        "endType": "by"      }    }  },  "estimateNumberPrefix": "EST-",  "userId": "6578278e879ad2646715ba9c",  "attachments": [    {      "id": "6241712be68f7a98102ba272",      "name": "Electronics.pdf",      "url": "https://example.com/digital-delivery",      "type": "string",      "size": 10000    }  ],  "autoInvoice": {    "enabled": true,    "directPayments": true  },  "miscellaneousCharges": {    "charges": [      [        null      ]    ],    "collectedMiscellaneousCharges": 10,    "paidCharges": [      {        "name": "Processing Fee",        "charge": 10,        "amount": 10,        "_id": "673d01d7d547648a8dab6211"      }    ]  },  "paymentScheduleConfig": {    "type": "fixed",    "dateConfig": {      "depositDateType": "estimate_accepted",      "scheduleDateType": "regular_interval"    },    "schedules": [      [        null      ]    ]  }}'
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

Version — headerrequired

\---2021-07-28

Body required

{
  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "name": "Home Service Estimate",  "businessDetails": {    "logoUrl": "https://example.com/logo.png",    "name": "ABC Corp.",    "phoneNo": "+1-214-559-6993",    "address": "9931 Beechwood, TX",    "website": "wwww.example.com",    "customValues": \[      "string"    \]  },  "currency": "USD",  "items": \[    {      "name": "ABC Product",      "description": "ABC Corp.",      "productId": "6578278e879ad2646715ba9c",      "priceId": "6578278e879ad2646715ba9c",      "currency": "USD",      "amount": 999,      "qty": 1,      "taxes": \[        {          "\_id": "string",          "name": "string",          "rate": 0,          "calculation": "exclusive",          "description": "string",          "taxId": "string"        }      \],      "automaticTaxCategoryId": "6578278e879ad2646715ba9c",      "isSetupFeeItem": true,      "type": "one\_time",      "taxInclusive": true    }  \],  "liveMode": true,  "discount": {    "value": 10,    "type": "percentage",    "validOnProductIds": "\[ '6579751d56f60276e5bd4154' \]"  },  "termsNotes": "<p>This is a default terms.</p>",  "title": "ESTIMATE",  "contactDetails": {    "id": "6578278e879ad2646715ba9c",    "name": "Alex",    "phoneNo": "+1234567890",    "email": "alex@example.com",    "additionalEmails": \[      {        "email": "alex@example.com"      }    \],    "companyName": "ABC Corp.",    "address": {      "addressLine1": "9931 Beechwood",      "addressLine2": "Beechwood",      "city": "St. Houston",      "state": "TX",      "countryCode": "US",      "postalCode": "559-6993"    },    "customFields": \[      "string"    \]  },  "estimateNumber": 1001,  "issueDate": "2024-08-07",  "expiryDate": "2024-08-10",  "sentTo": {    "email": \[      "alex@example.com"    \],    "emailCc": \[      "alex@example.com"    \],    "emailBcc": \[      "alex@example.com"    \],    "phoneNo": \[      "+1-214-559-6993"    \]  },  "automaticTaxesEnabled": true,  "meta": {    "key": "value"  },  "sendEstimateDetails": {    "altId": "6578278e879ad2646715ba9c",    "altType": "location",    "action": "sms\_and\_email",    "liveMode": true,    "userId": "6578278e879ad2646715ba9c",    "sentFrom": {      "fromName": "Alex",      "fromEmail": "alex@example.com"    },    "estimateName": "Estimate"  },  "frequencySettings": {    "enabled": true,    "schedule": {      "executeAt": "string",      "rrule": {        "intervalType": "monthly",        "interval": 2,        "startDate": "2023-01-01",        "startTime": "20:45:00",        "endDate": "2029-11-01",        "endTime": "18:45:00",        "dayOfMonth": 15,        "dayOfWeek": "mo",        "numOfWeek": \-1,        "monthOfYear": "jan",        "count": 10,        "daysBefore": 5,        "useStartAsPrimaryUserAccepted": true,        "endType": "by"      }    }  },  "estimateNumberPrefix": "EST-",  "userId": "6578278e879ad2646715ba9c",  "attachments": \[    {      "id": "6241712be68f7a98102ba272",      "name": "Electronics.pdf",      "url": "https://example.com/digital-delivery",      "type": "string",      "size": 10000    }  \],  "autoInvoice": {    "enabled": true,    "directPayments": true  },  "miscellaneousCharges": {    "charges": \[      \[        null      \]    \],    "collectedMiscellaneousCharges": 10,    "paidCharges": \[      {        "name": "Processing Fee",        "charge": 10,        "amount": 10,        "\_id": "673d01d7d547648a8dab6211"      }    \]  },  "paymentScheduleConfig": {    "type": "fixed",    "dateConfig": {      "depositDateType": "estimate\_accepted",      "scheduleDateType": "regular\_interval"    },    "schedules": \[      \[        null      \]    \]  }
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
