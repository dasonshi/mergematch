# https://marketplace.gohighlevel.com/docs/ghl/store/list-shipping-carriers

# List Shipping Carriers

GET 

## https://services.leadconnectorhq.com/store/shipping-carrier

The "List Shipping Carrier" API allows to retrieve a list of shipping carrier.

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Query Parameters

**altId** stringrequired

Location Id or Agency Id

Example: 6578278e879ad2646715ba9c

**altType** stringrequired

**Possible values:** \[`location`\]

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

**status** booleanrequired

Status of api action

Example:`true`

**message** string

Success message

Example:`Successfully created`

**data** object\[\]required

An array of items

*   Array \[
    

**altId** stringrequired

Location Id or Agency Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

**Possible values:** \[`location`\]

**name** stringrequired

Name of the shipping carrier

Example:`FedEx`

**callbackUrl** stringrequired

The URL endpoint that GHL needs to retrieve shipping rates. This must be a public URL.

Example:`https://example.com/get-shipping-rates`

**services** object\[\]

An array of available shipping carrier services

*   Array \[
    

**name** stringrequired

Name of the shipping carrier service

Example:`Priority Mail Express International`

**value** stringrequired

Value of the shipping carrier service

Example:`PriorityMailExpressInternational`

*   \]
    

**allowsMultipleServiceSelection** boolean

The seller can choose multiple services while creating shipping rates if this is true.

Example:`true`

**\_id** stringrequired

The unique identifier for the product.

Example:`655b33a82209e60b6adb87a5`

**marketplaceAppId** stringrequired

The unique identifier for the marketplace app.

Example:`655b33a82209e60b6adb87a5`

**createdAt** stringrequired

created at

Example:`2023-12-12T09:27:42.355Z`

**updatedAt** stringrequired

updated at

Example:`2023-12-12T09:27:42.355Z`

*   \]
    

```
{  "status": true,  "message": "Successfully created",  "data": [    {      "altId": "6578278e879ad2646715ba9c",      "altType": "location",      "name": "FedEx",      "callbackUrl": "https://example.com/get-shipping-rates",      "services": [        {          "name": "Priority Mail Express International",          "value": "PriorityMailExpressInternational"        }      ],      "allowsMultipleServiceSelection": true,      "_id": "655b33a82209e60b6adb87a5",      "marketplaceAppId": "655b33a82209e60b6adb87a5",      "createdAt": "2023-12-12T09:27:42.355Z",      "updatedAt": "2023-12-12T09:27:42.355Z"    }  ]}
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

**name:** [Authorization](/docs/ghl/store/store-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/store/shipping-carrier' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

altId — queryrequired

altType — queryrequired

\---location

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
