# https://marketplace.gohighlevel.com/docs/ghl/products/get-reviews-count

# Fetch Review Count as per status

GET 

## https://services.leadconnectorhq.com/products/reviews/count

API to fetch the Review Count as per status

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

### Query Parameters

**altId** stringrequired

Location Id or Agency Id

Example: 6578278e879ad2646715ba9c

**altType** stringrequired

**Possible values:** \[`location`\]

**rating** number

Key to filter the ratings

Example: 4

**startDate** string

The start date for filtering reviews

Example: 2023-01-01T00:00:00Z

**endDate** string

The end date for filtering reviews

Example: 2023-12-31T23:59:59Z

**productId** string

Comma-separated list of product IDs

Example: 60d21b4667d0d8992e610c88,60d21b4667d0d8992e610c89,60d21b4667d0d8992e610c8a

**storeId** string

Comma-separated list of store IDs

Example: 60d21b4667d0d8992e610c85,60d21b4667d0d8992e610c86,60d21b4667d0d8992e610c87

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

**data** array\[\]required

Array of review status counts

```
{  "data": [    [      null    ]  ]}
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
curl -L 'https://services.leadconnectorhq.com/products/reviews/count' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

Version — headerrequired

\---2021-07-28

Show optional parameters

rating — query

startDate — query

endDate — query

productId — query

storeId — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
