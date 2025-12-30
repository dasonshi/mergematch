# https://marketplace.gohighlevel.com/docs/ghl/proposals/send-documents-contracts

# Send document

POST 

## https://services.leadconnectorhq.com/proposals/document/send

Send document to a client

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

*   application/json

### Body**required**

**locationId** stringrequired

Location Id

Example:`hTlkh7t8gujsahgg93`

**documentId** stringrequired

Document Id

Example:`hTlkh7t8gujsahgg93`

**documentName** string

Document Name

Example:`new Document`

**medium** string

Medium to be used for sending the document

**Possible values:** \[`link`, `email`\]

Example:`email`

**ccRecipients** object\[\]

CC Recipient

*   Array \[
    

**email** stringrequired

Email

Example:`jim@gmail.com`

**id** stringrequired

Contact ID

Example:`contactId`

**imageUrl** stringrequired

Contact Image URL

Example:`https://example.com/image.jpg`

**contactName** stringrequired

Contact Name

Example:`Jim Anton`

**firstName** stringrequired

First Name

Example:`Jim`

**lastName** stringrequired

Last Name

Example:`Anton`

*   \]
    

**notificationSettings** object

**receive** objectrequired

**templateId** stringrequired

**subject** stringrequired

**sender** objectrequired

**fromEmail** stringrequired

**fromName** stringrequired

**sentBy** stringrequired

Sent ByUser Id

Example:`1234567890`

## Responses[​](#responses "Direct link to Responses")

*   200
*   400

Document sent successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**success** booleanrequired

Success status

Example:`true`

**links** object\[\]required

Links for all recipients

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
    

```
{  "success": true,  "links": [    {      "referenceId": "550e8400-e29b-41d4-a716-446655440000",      "documentId": "c1e87a91-93b2-4b78-821f-85cf0e1f925b",      "recipientId": "u240JcS0E5qE0ziHnwMm",      "entityName": "contacts",      "recipientCategory": "recipient",      "documentRevision": 1,      "createdBy": "b6d8fa28-1112-4dc7-b9d2-f22b75a477ea",      "deleted": false    }  ]}
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
curl -L 'https://services.leadconnectorhq.com/proposals/document/send' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "locationId": "hTlkh7t8gujsahgg93",  "documentId": "hTlkh7t8gujsahgg93",  "documentName": "new Document",  "medium": "email",  "ccRecipients": [    {      "id": "u240JcS0E5qE0ziHnwMm",      "email": "jim@gmail.com",      "imageUrl": "",      "contactName": "Jim Anton",      "firstName": "Jim",      "lastName": "Anton"    }  ],  "notificationSettings": {    "sender": {      "fromName": "",      "fromEmail": ""    },    "receive": {      "subject": "",      "templateId": ""    }  },  "sentBy": "1234567890"}'
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

Authorization — headerrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "locationId": "hTlkh7t8gujsahgg93",  "documentId": "hTlkh7t8gujsahgg93",  "documentName": "new Document",  "medium": "email",  "ccRecipients": \[    {      "id": "u240JcS0E5qE0ziHnwMm",      "email": "jim@gmail.com",      "imageUrl": "",      "contactName": "Jim Anton",      "firstName": "Jim",      "lastName": "Anton"    }  \],  "notificationSettings": {    "sender": {      "fromName": "",      "fromEmail": ""    },    "receive": {      "subject": "",      "templateId": ""    }  },  "sentBy": "1234567890"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
