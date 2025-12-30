# https://marketplace.gohighlevel.com/docs/ghl/invoices/list-invoice-templates

# List templates

GET 

## https://services.leadconnectorhq.com/invoices/template

API to get list of templates

### Requirements

#### Scope(s)

`invoices/template.readonly`

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

**limit** stringrequired

Limit the number of items to return

Example: 10

**offset** stringrequired

Number of items to skip

Example: 10

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

**data** object\[\]required

*   Array \[
    

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

*   \]
    

**totalCount** numberrequired

Total number of Templates

Example:`100`

```
{  "data": [    {      "_id": "6578278e879ad2646715ba9c",      "altId": "6578278e879ad2646715ba9c",      "altType": "location",      "name": "New Template",      "businessDetails": {        "name": "Alex",        "address": {          "addressLine1": "9931 Beechwood",          "city": "St. Houston",          "state": "TX",          "countryCode": "USA",          "postalCode": "559-6993"        },        "phoneNo": "+1-214-559-6993",        "website": "www.example.com"      },      "currency": "USD",      "discount": {        "type": "percentage",        "value": 0      },      "items": [        {          "taxes": [],          "_id": "c6tZZU0rJBf30ZXx9Gli",          "productId": "c6tZZU0rJBf30ZXx9Gli",          "priceId": "c6tZZU0rJBf30ZXx9Gli",          "currency": "USD",          "name": "Macbook Pro",          "qty": 1,          "amount": 999        }      ],      "invoiceNumberPrefix": "INV-",      "total": 999,      "createdAt": "2023-12-12T09:27:42.355Z",      "updatedAt": "2023-12-12T09:27:42.355Z"    }  ],  "totalCount": 100}
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

**name:** [Authorization](/docs/ghl/invoices/invoice-api#authentication)**type:** http**scopes:** `invoices/template.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/invoices/template' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
