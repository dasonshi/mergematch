# https://marketplace.gohighlevel.com/docs/ghl/businesses/update-business

# Update Business

PUT 

## https://services.leadconnectorhq.com/businesses/:businessId

Update Business

### Requirements

#### Scope(s)

`businesses.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Path Parameters

**businessId** stringrequired

Example: 5DP4iH6HLkQsiKESj6rh

*   application/json

### Body**required**

**name** string

Example:`Microsoft`

**phone** string

Example:`+18832327657`

**email** string

Example:`john@deo.com`

**postalCode** string

Example:`12312312`

**website** string

Example:`www.xyz.com`

**address** string

Example:`street adress`

**state** string

Example:`new york`

**city** string

Example:`new york`

**country** string

Example:`us`

**description** string

Example:`business description`

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

**success** booleanrequired

Success Value

Example:`true`

**buiseness** object

Business Response

**id** stringrequired

Business Id

Example:`63771dcac1116f0e21de8e12`

**name** stringrequired

Business Name

Example:`Microsoft`

**phone** string

phone number

**email** string

email

Example:`abc@microsoft.com`

**website** string

website

Example:`microsoft.com`

**address** string

address

**city** string

city

**description** string

description

**state** string

state

**postalCode** string

postal code

**country** string

country

Example:`united states`

**updatedBy** object

updated By

**locationId** stringrequired

locaitonId

**createdBy** object

Created By

**createdAt** date-time

Creation Time

**updatedAt** date-time

Last updation time

```
{  "success": true,  "buiseness": {    "id": "63771dcac1116f0e21de8e12",    "name": "Microsoft",    "phone": "string",    "email": "abc@microsoft.com",    "website": "microsoft.com",    "address": "string",    "city": "string",    "description": "string",    "state": "string",    "postalCode": "string",    "country": "united states",    "updatedBy": {},    "locationId": "string",    "createdBy": {},    "createdAt": "2024-07-29T15:51:28.071Z",    "updatedAt": "2024-07-29T15:51:28.071Z"  }}
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

**name:** [Authorization](/docs/ghl/businesses/business-api#authentication)**type:** http**scopes:** `businesses.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PUT 'https://services.leadconnectorhq.com/businesses/:businessId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "Microsoft",  "phone": "+18832327657",  "email": "john@deo.com",  "postalCode": "12312312",  "website": "www.xyz.com",  "address": "street adress",  "state": "new york",  "city": "new york",  "country": "us",  "description": "business description"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

businessId — pathrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "name": "Microsoft",  "phone": "+18832327657",  "email": "john@deo.com",  "postalCode": "12312312",  "website": "www.xyz.com",  "address": "street adress",  "state": "new york",  "city": "new york",  "country": "us",  "description": "business description"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
