# https://marketplace.gohighlevel.com/docs/ghl/products/bulk-update

# Bulk Update Products

POST 

## https://services.leadconnectorhq.com/products/bulk-update

API to bulk update products (price, availability, collections, delete)

### Requirements

#### Scope(s)

`products.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

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

**type** stringrequired

Type of bulk update operation

**Possible values:** \[`bulk-update-price`, `bulk-update-availability`, `bulk-update-product-collection`, `bulk-delete-products`, `bulk-update-currency`\]

Example:`bulk-update-price`

**productIds** string\[\]required

Array of product IDs

Example:`["5f8d0d55b54764421b7156c1"]`

**filters** object

Filters to apply when selectAll is true

**collectionIds** string\[\]

Filter by collection IDs

Example:`["5f8d0d55b54764421b7156c1","5f8d0d55b54764421b7156c2"]`

**productType** string

Filter by product type

Example:`one-time`

**availableInStore** boolean

Filter by availability status

Example:`true`

**search** string

Filter by search term

Example:`blue t-shirt`

**price** object

Price update configuration

**type** stringrequired

Type of price update

**Possible values:** \[`INCREASE_BY_AMOUNT`, `REDUCE_BY_AMOUNT`, `SET_NEW_PRICE`, `INCREASE_BY_PERCENTAGE`, `REDUCE_BY_PERCENTAGE`\]

Example:`INCREASE_BY_AMOUNT`

**value** numberrequired

Value to update (amount or percentage based on type)

Example:`100`

**roundToWhole** boolean

Round to nearest whole number

Example:`true`

**compareAtPrice** object

Compare at price update configuration

**type** stringrequired

Type of price update

**Possible values:** \[`INCREASE_BY_AMOUNT`, `REDUCE_BY_AMOUNT`, `SET_NEW_PRICE`, `INCREASE_BY_PERCENTAGE`, `REDUCE_BY_PERCENTAGE`\]

Example:`INCREASE_BY_AMOUNT`

**value** numberrequired

Value to update (amount or percentage based on type)

Example:`100`

**roundToWhole** boolean

Round to nearest whole number

Example:`true`

**availability** boolean

New availability status

**collectionIds** string\[\]

Array of collection IDs

**currency** string

Currency code

Example:`USD`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   422

Products updated successfully

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

```
{  "status": true,  "message": "Successfully created"}
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

**name:** [Authorization](/docs/ghl/products/products-api#authentication)**type:** http**scopes:** `products.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/products/bulk-update' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "type": "bulk-update-price",  "productIds": [    "5f8d0d55b54764421b7156c1"  ],  "filters": {    "collectionIds": [      "5f8d0d55b54764421b7156c1",      "5f8d0d55b54764421b7156c2"    ],    "productType": "one-time",    "availableInStore": true,    "search": "blue t-shirt"  },  "price": {    "type": "INCREASE_BY_AMOUNT",    "value": 100,    "roundToWhole": true  },  "compareAtPrice": {    "type": "INCREASE_BY_AMOUNT",    "value": 100,    "roundToWhole": true  },  "availability": true,  "collectionIds": [    "string"  ],  "currency": "USD"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

Version — headerrequired

\---2021-07-28

Body required

{
  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "type": "bulk-update-price",  "productIds": \[    "5f8d0d55b54764421b7156c1"  \],  "filters": {    "collectionIds": \[      "5f8d0d55b54764421b7156c1",      "5f8d0d55b54764421b7156c2"    \],    "productType": "one-time",    "availableInStore": true,    "search": "blue t-shirt"  },  "price": {    "type": "INCREASE\_BY\_AMOUNT",    "value": 100,    "roundToWhole": true  },  "compareAtPrice": {    "type": "INCREASE\_BY\_AMOUNT",    "value": 100,    "roundToWhole": true  },  "availability": true,  "collectionIds": \[    "string"  \],  "currency": "USD"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
