# https://marketplace.gohighlevel.com/docs/ghl/products/bulk-update-product-review

# Update Product Reviews

POST 

## https://services.leadconnectorhq.com/products/reviews/bulk-update

Update one or multiple product reviews: status, reply, etc.

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

**reviews** object\[\]required

Array of Product Reviews

*   Array \[
    

**reviewId** stringrequired

Review Id

Example:`6578278e879ad2646715ba9c`

**productId** stringrequired

Product Id

Example:`6578278e879ad2646715ba9d`

**storeId** stringrequired

Store Id

Example:`a1b2c3d4e5f6g7h8i9j0k1l2`

*   \]
    

**status** objectrequired

Status of the review

Example:`approved`

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
curl -L 'https://services.leadconnectorhq.com/products/reviews/bulk-update' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "reviews": [    {      "reviewId": "6578278e879ad2646715ba9c",      "productId": "6578278e879ad2646715ba9d",      "storeId": "a1b2c3d4e5f6g7h8i9j0k1l2"    }  ],  "status": "approved"}'
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
  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "reviews": \[    {      "reviewId": "6578278e879ad2646715ba9c",      "productId": "6578278e879ad2646715ba9d",      "storeId": "a1b2c3d4e5f6g7h8i9j0k1l2"    }  \],  "status": "approved"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
