# https://marketplace.gohighlevel.com/docs/ghl/invoices/send-estimate

# Send Estimate

POST 

## https://services.leadconnectorhq.com/invoices/estimate/:estimateId/send

API to send estimate by estimate id

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

### Path Parameters

**estimateId** stringrequired

Estimate Id

Example: 5f9d6d8b1b2d2c001f2d9e4b

*   application/json

### Body**required**

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
curl -L 'https://services.leadconnectorhq.com/invoices/estimate/:estimateId/send' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "action": "sms_and_email",  "liveMode": true,  "userId": "6578278e879ad2646715ba9c",  "sentFrom": {    "fromName": "Alex",    "fromEmail": "alex@example.com"  },  "estimateName": "Estimate"}'
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

estimateId — pathrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "action": "sms\_and\_email",  "liveMode": true,  "userId": "6578278e879ad2646715ba9c",  "sentFrom": {    "fromName": "Alex",    "fromEmail": "alex@example.com"  },  "estimateName": "Estimate"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
