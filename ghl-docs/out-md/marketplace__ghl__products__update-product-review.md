# https://marketplace.gohighlevel.com/docs/ghl/products/update-product-review

# Update Product Reviews

PUT 

## https://services.leadconnectorhq.com/products/reviews/:reviewId

Update status, reply, etc of a particular review

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

### Path Parameters

**reviewId** stringrequired

Review Id

Example: 6578278e879ad2646715ba9c

*   application/json

### Body**required**

**altId** stringrequired

Location Id or Agency Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

**Possible values:** \[`location`\]

**productId** stringrequired

Product Id

Example:`6578278e879ad2646715ba9c`

**status** stringrequired

Status of the review

Example:`approved`

**reply** object\[\]

Reply of the review

*   Array \[
    

**headline** stringrequired

Headline of the Review

**Possible values:** `<= 200 characters`

Example:`Amazing product with great quality`

**comment** stringrequired

Detailed Review of the product

**Possible values:** `<= 5000 characters`

Example:`This product exceeded my expectations in terms of quality and performance. Highly recommended!`

**user** object

User who is giving the review/reply

**name** stringrequired

Name of the customer

**Possible values:** `non-empty` and `<= 100 characters`

Example:`John Doe`

**email** stringrequired

Email of the customer

Example:`example@example.com`

**phone** string

Phone no of the customer

Example:`+1-555-555-5555`

**isCustomer** boolean

Is the person an admin or customer

Example:`true`

*   \]
    

**rating** number

Rating of the product

Example:`4.5`

**headline** string

Headline of the Review

Example:`Amazing product with great quality`

**detail** string

Detailed Review of the product

Example:`The product is for sure a must and recommended buy`

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
curl -L -X PUT 'https://services.leadconnectorhq.com/products/reviews/:reviewId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "productId": "6578278e879ad2646715ba9c",  "status": "approved",  "reply": [    {      "headline": "Amazing product with great quality",      "comment": "This product exceeded my expectations in terms of quality and performance. Highly recommended!",      "user": {        "name": "John Doe",        "email": "example@example.com",        "phone": "+1-555-555-5555",        "isCustomer": true      }    }  ],  "rating": "4.5",  "headline": "Amazing product with great quality",  "detail": "The product is for sure a must and recommended buy"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

reviewId — pathrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "productId": "6578278e879ad2646715ba9c",  "status": "approved",  "reply": \[    {      "headline": "Amazing product with great quality",      "comment": "This product exceeded my expectations in terms of quality and performance. Highly recommended!",      "user": {        "name": "John Doe",        "email": "example@example.com",        "phone": "+1-555-555-5555",        "isCustomer": true      }    }  \],  "rating": "4.5",  "headline": "Amazing product with great quality",  "detail": "The product is for sure a must and recommended buy"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
