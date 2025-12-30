# https://marketplace.gohighlevel.com/docs/ghl/products/get-product-store-stats

# Fetch Product Store Stats

GET 

## https://services.leadconnectorhq.com/products/store/:storeId/stats

API to fetch the total number of products, included in the store, and excluded from the store and other stats

### Requirements

#### Scope(s)

`products.readonly`

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

**storeId** stringrequired

Products related to the store

Example: 3SwdhCu3svxI8AKsPJt6

### Query Parameters

**altId** stringrequired

Location Id or Agency Id

Example: 6578278e879ad2646715ba9c

**altType** stringrequired

**Possible values:** \[`location`\]

**search** string

The name of the product for searching.

Example: Awesome product

**collectionIds** string

Filter by product collection Ids. Supports comma separated values

Example: 65c2789a812e52f9bd6ec577,65c2789a812e52de9a6ec576

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

**totalProducts** numberrequired

Total number of products

Example:`100`

**includedInStore** numberrequired

Number of products included in the store

Example:`80`

**excludedFromStore** numberrequired

Number of products excluded from the store

Example:`20`

```
{  "totalProducts": 100,  "includedInStore": 80,  "excludedFromStore": 20}
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

**name:** [Authorization](/docs/ghl/products/products-api#authentication)**type:** http**scopes:** `products.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/products/store/:storeId/stats' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

storeId — pathrequired

altId — queryrequired

altType — queryrequired

\---location

Version — headerrequired

\---2021-07-28

Show optional parameters

search — query

collectionIds — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
