# https://marketplace.gohighlevel.com/docs/ghl/proposals/list-documents-contracts

# List documents

GET 

## https://services.leadconnectorhq.com/proposals/document

List documents for a location

### Requirements

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

### Query Parameters

**locationId** stringrequired

Location Id

Example: hTlkh7t8gujsahgg93

**status** string

**Possible values:** \[`draft`, `sent`, `viewed`, `completed`, `accepted`\]

Document status, pass as comma separated values

Example: draft

**paymentStatus** string

**Possible values:** \[`waiting_for_payment`, `paid`, `no_payment`\]

Payment status, pass as comma separated values

Example: paid

**limit** number

Limit to fetch number of records

Example: 10

**skip** number

Skip number of records

Example: 0

**query** string

Search string

Example: document

**dateFrom** string

Date start from (ISO 8601), dateFrom & DateTo must be provided together

Example: 2025-02-03T18:30:00.000Z

**dateTo** string

Date to (ISO 8601), dateFrom & DateTo must be provided together

Example: 2025-02-14T18:29:59.999Z

## Responses[​](#responses "Direct link to Responses")

*   200
*   400

Document fetched successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**documents** object\[\]required

List of documents

*   Array \[
    

**locationId** stringrequired

Location Id

Example:`hTlkh7t8gujsahgg93`

**documentId** stringrequired

Document Id

Example:`hTlkh7t8gujsahgg93`

**\_id** stringrequired

Unique identifier

Example:`67ac9a51106ee8311e911XXXX`

**name** stringrequired

Name of the document

Example:`Document Name`

**type** stringrequired

Type of the document

Example:`proposal`

**deleted** booleanrequired

Whether the document is deleted

Example:`false`

**isExpired** booleanrequired

Whether the document is expired

Example:`false`

**documentRevision** numberrequired

Number of times document is moved to draft state

Example:`1`

**fillableFields** object\[\]required

Fillable fields

*   Array \[
    

**fieldId** stringrequired

Field Id

Example:`text_field_1`

**isRequired** booleanrequired

Is the field required

Example:`true`

**hasCompleted** booleanrequired

Has the field been completed

Example:`true`

**recipient** stringrequired

Recipient

Example:`John Doe`

**entityType** EntityReference (string)required

Entity type

**Possible values:** \[`contacts`, `users`\]

**id** stringrequired

Id

Example:`2d0a6fe1-d519-4198-8785-3da1d7cab925`

**type** ELEMENTS\_LOOKUP (string)required

Element type

**Possible values:** \[`Page`, `Text`, `Image`, `Video`, `Table`, `ProductList`, `PageBreak`, `Signature`, `PaymentDetails`, `TextField`, `DateField`, `InitialsField`, `Checkbox`, `Row`, `Column`\]

Example:`TextField`

**value** stringrequired

Value of the field

Example:`John Doe`

*   \]
    

**grandTotal** object

Grand total object of the document

**amount** numberrequired

Total amount before discounts

Example:`100`

**currency** stringrequired

Currency of the total amount

Example:`USD`

**discountPercentage** numberrequired

Total discount percentage applied

Example:`15`

**discounts** object\[\]required

List of applied discounts

*   Array \[
    

**id** stringrequired

Unique identifier for the discount

Example:`123456`

**value** numberrequired

Discount value (either a percentage or custom amount)

Example:`10`

**type** stringrequired

Type of discount

**Possible values:** \[`percentage`, `custom_amount`\]

Example:`percentage`

*   \]
    

**locale** stringrequired

Locale of the location

Example:`en-US`

**status** string\[\]required

Document status

**Possible values:** \[`draft`, `sent`, `viewed`, `completed`, `accepted`\]

Example:`draft`

**paymentStatus** string\[\]required

Payment status

**Possible values:** \[`waiting_for_payment`, `paid`, `no_payment`\]

Example:`paid`

**recipients** object\[\]required

Recipients

*   Array \[
    

**id** stringrequired

Recipient Id

Example:`u240JcS0E5qE0ziHnwMm`

**firstName** string

Recipient First Name

Example:`Jim`

**lastName** string

Recipient Last Name

Example:`Anton`

**email** stringrequired

Recipient Email

Example:`jim@gmail.com`

**phoneNumber** string

Recipient Phone Number

Example:`+1234567890`

**phone** string

Recipient Phone

Example:`1234567890`

**hasCompleted** booleanrequired

Recipient has completed the document

Example:`true`

**role** stringrequired

Recipient role

**Possible values:** \[`user`, `signer`\]

Example:`signer`

**isPrimary** booleanrequired

Recipient is primary

Example:`true`

**signingOrder** numberrequired

Recipient signing order

Example:`1`

**imgUrl** string

Recipient image url

Example:`base64 image url`

**ip** string

Recipient ip

Example:`123.123.123.123`

**userAgent** string

Recipient user agent

Example:`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`

**signedDate** string

Recipient signed date

Example:`2025-02-03T18:30:00.000Z`

**contactName** string

Recipient contact name

Example:`Jim Anton`

**country** string

Recipient country

Example:`United States`

**entityName** string

Recipient entity name

Example:`Jim Anton`

**initialsImgUrl** string

Recipient initials image url

Example:`base64 image url`

**lastViewedAt** string

Recipient last viewed date

Example:`2025-02-03T18:30:00.000Z`

**shareLink** string

Share link

Example:`https://www.google.com`

*   \]
    

**links** object\[\]required

Links for the document if its sent

*   Array \[
    

**referenceId** stringrequired

Reference ID

Example:`550e8400-e29b-41d4-a716-446655440000`

**documentId** stringrequired

Document ID

Example:`c1e87a91-93b2-4b78-821f-85cf0e1f925b`

**recipientId** stringrequired

Recipient ID

Example:`u240JcS0E5qE0ziHnwMm`

**entityName** stringrequired

Entity name that the recipient belongs to

**Possible values:** \[`contacts`, `users`\]

Example:`contacts`

**recipientCategory** stringrequired

Recipient category (recipient, cc, or bcc)

**Possible values:** \[`recipient`, `cc`, `bcc`\]

Example:`recipient`

**documentRevision** numberrequired

Document revision number

Example:`1`

**createdBy** stringrequired

Created by user ID

Example:`b6d8fa28-1112-4dc7-b9d2-f22b75a477ea`

**deleted** booleanrequired

Whether the document is deleted

Example:`false`

*   \]
    

**updatedAt** stringrequired

Date start from (ISO 8601)

Example:`2025-02-03T18:30:00.000Z`

**createdAt** stringrequired

Date to (ISO 8601)

Example:`2025-02-14T18:29:59.999Z`

*   \]
    

**total** numberrequired

Total records available

Example:`10`

**whiteLabelBaseUrl** number

WhiteLabel url for document

Example:`https://example.com`

**whiteLabelBaseUrlForInvoice** number

WhiteLabel url for invoice

Example:`https://example.com`

```
{  "documents": [    {      "locationId": "hTlkh7t8gujsahgg93",      "documentId": "hTlkh7t8gujsahgg93",      "_id": "67ac9a51106ee8311e911XXXX",      "name": "Document Name",      "type": "proposal",      "deleted": false,      "isExpired": false,      "documentRevision": 1,      "fillableFields": [        {          "fieldId": "text_field_1",          "isRequired": true,          "hasCompleted": true,          "recipient": "John Doe",          "entityType": "contacts",          "id": "2d0a6fe1-d519-4198-8785-3da1d7cab925",          "type": "TextField",          "value": "John Doe"        }      ],      "grandTotal": {        "amount": 100,        "currency": "USD",        "discountPercentage": 15,        "discounts": [          {            "id": "123456",            "value": 10,            "type": "percentage"          }        ]      },      "locale": "en-US",      "status": "draft",      "paymentStatus": "paid",      "recipients": [        {          "id": "u240JcS0E5qE0ziHnwMm",          "email": "jim@gmail.com",          "imageUrl": "",          "contactName": "Jim Anton",          "firstName": "Jim",          "lastName": "Anton",          "role": "signer",          "hasCompleted": true,          "signingOrder": 1,          "imgUrl": "base64 image url",          "ip": "123.123.123.123"        }      ],      "links": [        {          "referenceId": "550e8400-e29b-41d4-a716-446655440000",          "documentId": "c1e87a91-93b2-4b78-821f-85cf0e1f925b",          "recipientId": "u240JcS0E5qE0ziHnwMm",          "entityName": "contacts",          "recipientCategory": "recipient",          "documentRevision": 1,          "createdBy": "b6d8fa28-1112-4dc7-b9d2-f22b75a477ea",          "deleted": false        }      ],      "updatedAt": "2025-02-03T18:30:00.000Z",      "createdAt": "2025-02-14T18:29:59.999Z"    }  ],  "total": 10,  "whiteLabelBaseUrl": "https://example.com",  "whiteLabelBaseUrlForInvoice": "https://example.com"}
```

Unprocessable Entity

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

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/proposals/documents-and-contracts-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/proposals/document' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

locationId — queryrequired

Authorization — headerrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

status — query

\---draftsentviewedcompletedaccepted

paymentStatus — query

\---waiting\_for\_paymentpaidno\_payment

limit — query

skip — query

query — query

dateFrom — query

dateTo — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
