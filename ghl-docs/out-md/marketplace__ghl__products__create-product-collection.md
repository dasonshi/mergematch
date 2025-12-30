# https://marketplace.gohighlevel.com/docs/ghl/products/create-product-collection

# Create Product Collection

POST 

## https://services.leadconnectorhq.com/products/collections

Create a new Product Collection for a specific location

### Requirements

#### Scope(s)

`products/collection.write`

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

Location Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

The type of alt. For now it is only LOCATION

**Possible values:** \[`location`\]

Example:`LOCATION`

**collectionId** string

Unique Identifier of the Product Collection, Mongo Id

Example:`66057f9d28536eae584ec047`

**name** stringrequired

Name of the Product Collection

Example:`Best Sellers`

**slug** stringrequired

Slug of the Product Collection which helps in navigation

Example:`best-sellers`

**image** string

The URL of the image that is going to be displayed as the collection Thumbnail

Example:`http://example.com/watermark.png`

**seo** object

The metadata information which will be displayed in SEO previews

**title** string

The title which will be displayed as an SEO format

Example:`Best Sellers`

**description** string

The description which would be displayed in preview purposes

Example:`Collections where all the best products are available`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   422

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**data** object

created Collection

**\_id** stringrequired

The unique identifier for the collection

Example:`655b33a82209e60b6adb87a5`

**altId** stringrequired

Location Id to which the collection is associated

Example:`Z4Bxl8J4SaPEPLq9IQ8g`

**name** stringrequired

Name of the collection

Example:`Best Sellers`

**slug** stringrequired

Slug of the collection with which navigation is established. Special Characters and spacing is not allowed and should be unique

Example:`best-sellers`

**image** stringrequired

The URL of the image that is going to be displayed as the collection Thumbnail

Example:`http://example.com/watermark.png`

**seo** objectrequired

The information which will be displayed in SEO previews

**title** string

The title which will be displayed as an SEO format

Example:`Best Sellers`

**description** string

The description which would be displayed in preview purposes

Example:`Collections where all the best products are available`

**createdAt** stringrequired

Date at which the collection was created

Example:`2024-02-22T09:27:19.728Z`

```
{  "data": {    "_id": "655b33a82209e60b6adb87a5",    "altId": "Z4Bxl8J4SaPEPLq9IQ8g",    "name": "Best Sellers",    "slug": "best-sellers",    "image": "http://example.com/watermark.png",    "seo": {      "title": "Best Sellers",      "description": "Collections where all the best products are available"    },    "createdAt": "2024-02-22T09:27:19.728Z"  }}
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

**name:** [Authorization](/docs/ghl/products/products-api#authentication)**type:** http**scopes:** `products/collection.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/products/collections' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "altId": "6578278e879ad2646715ba9c",  "altType": "LOCATION",  "collectionId": "66057f9d28536eae584ec047",  "name": "Best Sellers",  "slug": "best-sellers",  "image": "http://example.com/watermark.png",  "seo": {    "title": "Best Sellers",    "description": "Collections where all the best products are available"  }}'
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
  "altId": "6578278e879ad2646715ba9c",  "altType": "LOCATION",  "collectionId": "66057f9d28536eae584ec047",  "name": "Best Sellers",  "slug": "best-sellers",  "image": "http://example.com/watermark.png",  "seo": {    "title": "Best Sellers",    "description": "Collections where all the best products are available"  }
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
