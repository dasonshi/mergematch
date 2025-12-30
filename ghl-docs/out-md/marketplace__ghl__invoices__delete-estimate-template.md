# https://marketplace.gohighlevel.com/docs/ghl/invoices/delete-estimate-template

# Delete Estimate Template

DELETE 

## https://services.leadconnectorhq.com/invoices/estimate/template/:templateId

Delete an existing estimate template

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

**templateId** stringrequired

Template Id

Example: 5f9d6d8b1b2d2c001f2d9e4b

*   application/json

### Body**required**

**altId** stringrequired

Location Id or Agency Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

**Possible values:** \[`location`\]

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   422

Successfully deleted

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

```
{  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "_id": "67ac9a51106ee8311e911XXXX",  "liveMode": true,  "deleted": false,  "name": "Estimate Name",  "currency": "USD",  "businessDetails": {    "logoUrl": "your_image-url",    "name": "Business name",    "address": {      "addressLine1": "address line 1",      "city": "Test City",      "state": "State Name",      "countryCode": "US",      "postalCode": "12345"    },    "phoneNo": "+1 1234567890",    "website": "www.example.com",    "customValues": [      {        "name": "Test",        "fieldKey": "{{custom_values.test}}",        "id": "5DYTWoiQvWiIJZXX44XXX",        "value": "Test's Custom Value"      }    ]  },  "items": [    {      "taxes": [],      "taxInclusive": false,      "_id": "67ac9a51106ee8311e911XXXX",      "description": "<p>Futuristic anti-gravity racing</p>",      "currency": "USD",      "productId": "67ac9a51106ee8311e911XXXX",      "priceId": "67ac9a51106ee8311e911XXXX",      "amount": 9.99,      "qty": 1,      "name": "TEST",      "type": "one_time"    },    {      "taxes": [        {          "_id": "67ac9a51106ee8311e911XXXX",          "name": "TaxTwo",          "rate": 8.5,          "calculation": "exclusive"        }      ],      "taxInclusive": true,      "_id": "67ac9a51106ee8311e911XXXX",      "productId": "67ac9a51106ee8311e911XXXX",      "priceId": "67ac9a51106ee8311e911XXXX",      "currency": "USD",      "name": "TEST2",      "qty": 1,      "amount": 500,      "description": "",      "type": "recurring"    }  ],  "discount": {    "type": "percentage",    "value": 0  },  "title": "ESTIMATE",  "estimateNumberPrefix": "EST-",  "attachments": [    {      "id": "6241712be68f7a98102ba272",      "name": "Electronics.pdf",      "url": "https://example.com/digital-delivery",      "type": "string",      "size": 10000    }  ],  "updatedBy": "3HIpOF9NIc5ltriQXXXX",  "total": 1222.03,  "createdAt": "2025-02-12T13:17:47.416Z",  "updatedAt": "2025-02-12T13:17:47.416Z",  "__v": 0,  "automaticTaxesEnabled": false,  "termsNotes": "<p>All services are subject to availability.</p>"}
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
curl -L -X DELETE 'https://services.leadconnectorhq.com/invoices/estimate/template/:templateId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "altId": "6578278e879ad2646715ba9c",  "altType": "location"}'
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

Version — headerrequired

\---2021-07-28

Body required

{
  "altId": "6578278e879ad2646715ba9c",  "altType": "location"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
