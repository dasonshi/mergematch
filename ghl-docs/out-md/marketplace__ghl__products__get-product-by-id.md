# https://marketplace.gohighlevel.com/docs/ghl/products/get-product-by-id

# Get Product by ID

GET 

## https://services.leadconnectorhq.com/products/:productId

The "Get Product by ID" API allows to retrieve information for a specific product using its unique identifier. Use this endpoint to fetch details for a single product based on the provided product ID.

### Requirements

#### Scope(s)

`products.readonly`

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

ID or the slug of the product that needs to be returned

Example: 6578278e879ad2646715ba9c

### Query Parameters

**locationId** stringrequired

location Id

Example: 6578278e879ad2646715ba9c

**sendWishlistStatus** boolean

Parameter which will decide whether to show the wishlisting status of products

Example:

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

The unique identifier for the product.

Example:`655b33a82209e60b6adb87a5`

**description** string

product description

Example:`This is a really awesome product`

**variants** object\[\]

An array of variants for the product.

*   Array \[
    

**id** stringrequired

A unique identifier for the variant.

Example:`38s63qmxfr4`

**name** stringrequired

The name of the variant.

Example:`Size`

**options** object\[\]required

An array of options for the variant.

*   Array \[
    

**id** stringrequired

The unique identifier for the option.

Example:`h4z7u0im2q8`

**name** stringrequired

The name of the option.

Example:`XL`

*   \]
    

*   \]
    

**locationId** stringrequired

The unique identifier for the location.

Example:`3SwdhCsvxI8Au3KsPJt6`

**name** stringrequired

The name of the product.

Example:`Awesome Product`

**productType** stringrequired

The type of the product (e.g., PHYSICAL).

Example:`PHYSICAL`

**availableInStore** boolean

Indicates whether the product is available in-store.

Example:`true`

**createdAt** date-timerequired

The creation timestamp of the product.

Example:`2023-11-20T10:23:36.515Z`

**updatedAt** date-timerequired

The last update timestamp of the product.

Example:`2024-01-23T09:57:04.846Z`

**statementDescriptor** string

The statement descriptor for the product.

Example:`abcde`

**image** string

The URL for the product image.

Example:`https://storage.googleapis.com/ghl-test/3SwdhCsvxI8Au3KsPJt6/media/65af8d5df88bdb4b1022ee90.png`

**collectionIds** string\[\]

An array of category Ids for the product

Example:`["65d71377c326ea78e1c47df5","65d71377c326ea78e1c47d34"]`

**isTaxesEnabled** boolean

The field indicates whether taxes are enabled for the product or not.

**Default value:** `false`

Example:`true`

**taxes** string\[\]

An array of ids of Taxes attached to the Product. If the expand query includes tax, the taxes will be of type `ProductTaxDto`. Please refer to the `ProductTaxDto` for additional details.

Example:`["654492a4e6bef380114de15a"]`

**automaticTaxCategoryId** string

Tax category ID for Automatic taxes calculation.

Example:`65d71377c326ea78e1c47df5`

**label** object

The Product label details

**title** stringrequired

The content for the product label.

Example:`Featured`

**startDate** string

Start date in YYYY-MM-DDTHH:mm:ssZ format

Example:`2024-06-26T05:43:35.000Z`

**endDate** string

Start date in YYYY-MM-DDTHH:mm:ssZ format

Example:`2024-06-30T05:43:39.000Z`

**slug** string

The slug of the product by which the product will be navigated

Example:`washing-machine`

```
{  "_id": "655b33a82209e60b6adb87a5",  "description": "This is a really awesome product",  "variants": [    {      "id": "38s63qmxfr4",      "name": "Size",      "options": [        {          "id": "h4z7u0im2q8",          "name": "XL"        }      ]    }  ],  "locationId": "3SwdhCsvxI8Au3KsPJt6",  "name": "Awesome Product",  "productType": "PHYSICAL",  "availableInStore": true,  "createdAt": "2023-11-20T10:23:36.515Z",  "updatedAt": "2024-01-23T09:57:04.846Z",  "statementDescriptor": "abcde",  "image": "https://storage.googleapis.com/ghl-test/3SwdhCsvxI8Au3KsPJt6/media/65af8d5df88bdb4b1022ee90.png",  "collectionIds": [    "65d71377c326ea78e1c47df5",    "65d71377c326ea78e1c47d34"  ],  "isTaxesEnabled": true,  "taxes": [    "654492a4e6bef380114de15a"  ],  "automaticTaxCategoryId": "65d71377c326ea78e1c47df5",  "label": {    "title": "Featured",    "startDate": "2024-06-26T05:43:35.000Z",    "endDate": "2024-06-30T05:43:39.000Z"  },  "slug": "washing-machine"}
```

Product not found

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
curl -L 'https://services.leadconnectorhq.com/products/:productId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

locationId — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

sendWishlistStatus — query

\---truefalse

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
