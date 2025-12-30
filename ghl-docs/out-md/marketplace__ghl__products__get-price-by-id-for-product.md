# https://marketplace.gohighlevel.com/docs/ghl/products/get-price-by-id-for-product

# Get Price by ID for a Product

GET 

## https://services.leadconnectorhq.com/products/:productId/price/:priceId

The "Get Price by ID for a Product" API allows retrieving information for a specific price associated with a particular product using its unique identifier. Use this endpoint to fetch details for a single price based on the provided price ID and product ID.

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

### Path Parameters

**productId** stringrequired

ID of the product that needs to be used

Example: 6578278e879ad2646715ba9c

**priceId** stringrequired

ID of the price that needs to be returned

Example: 6578278e879ad2646715ba9c

### Query Parameters

**locationId** stringrequired

location Id

Example: 6578278e879ad2646715ba9c

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

**\_id** stringrequired

The unique identifier for the price.

Example:`655b33aa2209e60b6adb87a7`

**membershipOffers** object\[\]

An array of membership offers associated with the price.

*   Array \[
    

**label** stringrequired

Membership offer label

Example:`top_50`

**value** stringrequired

Membership offer label

Example:`50`

**\_id** stringrequired

The unique identifier for the membership offer.

Example:`655b33aa2209e60b6adb87a7`

*   \]
    

**variantOptionIds** string\[\]

An array of variant option IDs associated with the price.

Example:`["h4z7u0im2q8","h3nst2ltsnn"]`

**locationId** string

The unique identifier for the location.

Example:`3SwdhCsvxI8Au3KsPJt6`

**product** string

The unique identifier for the associated product.

Example:`655b33a82209e60b6adb87a5`

**userId** string

The unique identifier for the user.

Example:`6YAtzfzpmHAdj0e8GkKp`

**name** stringrequired

The name of the price.

Example:`Red / S`

**type** stringrequired

The type of the price (e.g., one\_time).

**Possible values:** \[`one_time`, `recurring`\]

Example:`one_time`

**currency** stringrequired

The currency code for the price.

Example:`INR`

**amount** numberrequired

The amount of the price.

Example:`199999`

**recurring** object

The recurring details of the price (if type is recurring).

**interval** stringrequired

The interval at which the recurring event occurs.

**Possible values:** \[`day`, `month`, `week`, `year`\]

Example:`day`

**intervalCount** numberrequired

The number of intervals between each occurrence of the event.

Example:`1`

**createdAt** date-time

The creation timestamp of the price.

Example:`2023-11-20T10:23:38.645Z`

**updatedAt** date-time

The last update timestamp of the price.

Example:`2024-01-23T09:57:04.852Z`

**compareAtPrice** number

The compare-at price for comparison purposes.

Example:`2000000`

**trackInventory** boolean

Indicates whether inventory tracking is enabled.

Example:`null`

**availableQuantity** number

Available inventory stock quantity

Example:`5`

**allowOutOfStockPurchases** boolean

Continue selling when out of stock

Example:`true`

```
{  "_id": "655b33aa2209e60b6adb87a7",  "membershipOffers": [    {      "label": "top_50",      "value": "50",      "_id": "655b33aa2209e60b6adb87a7"    }  ],  "variantOptionIds": [    "h4z7u0im2q8",    "h3nst2ltsnn"  ],  "locationId": "3SwdhCsvxI8Au3KsPJt6",  "product": "655b33a82209e60b6adb87a5",  "userId": "6YAtzfzpmHAdj0e8GkKp",  "name": "Red / S",  "type": "one_time",  "currency": "INR",  "amount": 199999,  "recurring": {    "interval": "day",    "intervalCount": 1  },  "createdAt": "2023-11-20T10:23:38.645Z",  "updatedAt": "2024-01-23T09:57:04.852Z",  "compareAtPrice": 2000000,  "trackInventory": null,  "availableQuantity": 5,  "allowOutOfStockPurchases": true}
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
curl -L 'https://services.leadconnectorhq.com/products/:productId/price/:priceId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

productId — pathrequired

priceId — pathrequired

locationId — queryrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
