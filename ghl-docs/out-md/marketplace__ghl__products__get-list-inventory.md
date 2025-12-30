# https://marketplace.gohighlevel.com/docs/ghl/products/get-list-inventory

# List Inventory

GET 

## https://services.leadconnectorhq.com/products/inventory

The "List Inventory API allows the user to retrieve a paginated list of inventory items. Use this endpoint to fetch details for multiple items in the inventory based on the provided query parameters.

### Requirements

#### Scope(s)

`products/prices.readonly`

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

**limit** number

The maximum number of items to be included in a single page of results

Default value:`0`

Example: 20

**offset** number

The starting index of the page, indicating the position from which the results should be retrieved.

Default value:`0`

Example: 0

**altId** stringrequired

Location Id or Agency Id

Example: 6578278e879ad2646715ba9c

**altType** stringrequired

**Possible values:** \[`location`\]

**search** string

Search string for Variant Search

Example: Product Name

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

**inventory** object\[\]required

List of inventory items

*   Array \[
    

**\_id** stringrequired

The unique identifier for the price

Example:`6241712be68f7a98102ba272`

**name** stringrequired

Name of the price/variant

Example:`Medium T-shirt`

**availableQuantity** numberrequired

Available quantity in inventory

Example:`50`

**sku** stringrequired

SKU for the product variant

Example:`TSHIRT-MED-001`

**allowOutOfStockPurchases** booleanrequired

Whether out of stock purchases are allowed

Example:`false`

**product** stringrequired

Product ID this price belongs to

Example:`6241712be68f7a98102ba270`

**updatedAt** stringrequired

Last update timestamp

Example:`2023-12-12T09:27:42.355Z`

**image** string

Product image URL

Example:`https://example.com/images/product.jpg`

**productName** string

Product name

Example:`T-shirt`

*   \]
    

**total** objectrequired

Total count of inventory items

Example:`{"total":100}`

```
{  "inventory": [    {      "_id": "6241712be68f7a98102ba272",      "name": "Medium T-shirt",      "availableQuantity": 50,      "sku": "TSHIRT-MED-001",      "allowOutOfStockPurchases": false,      "product": "6241712be68f7a98102ba270",      "updatedAt": "2023-12-12T09:27:42.355Z",      "image": "https://example.com/images/product.jpg",      "productName": "T-shirt"    }  ],  "total": {    "total": 100  }}
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

**name:** [Authorization](/docs/ghl/products/products-api#authentication)**type:** http**scopes:** `products/prices.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/products/inventory' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

Version — headerrequired

\---2021-07-28

Show optional parameters

limit — query

offset — query

search — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
