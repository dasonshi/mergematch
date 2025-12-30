# https://marketplace.gohighlevel.com/docs/ghl/products/bulk-edit

# Bulk Edit Products and Prices

POST 

## https://services.leadconnectorhq.com/products/bulk-update/edit

API to bulk edit products and their associated prices (max 30 entities)

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

**products** object\[\]required

Array of products to update. Note: The total count includes all prices within each product.

*   Array \[
    

**\_id** stringrequired

Product ID

Example:`64a1b2c3d4e5f67890123456`

**name** string

Product name

Example:`Premium Product`

**description** string

Product description

Example:`A high-quality premium product with excellent features and durability`

**image** string

Product image

Example:`https://example.com/product-image.jpg`

**availableInStore** boolean

Product availability in store

Example:`true`

**prices** object\[\]

Array of price variants for the product

*   Array \[
    

**\_id** stringrequired

Price ID

Example:`64a1b2c3d4e5f67890123456`

**name** string

Price name

Example:`Standard Plan`

**amount** number

Price amount

Example:`99.99`

**currency** string

Price currency

Example:`USD`

**compareAtPrice** number

Compare at price

Example:`129.99`

**availableQuantity** number

Available quantity

Example:`100`

**trackInventory** boolean

Track inventory

Example:`true`

**allowOutOfStockPurchases** boolean

Allow out of stock purchases

Example:`false`

**sku** string

SKU

Example:`SKU-001`

**trialPeriod** number

Trial period in days

Example:`7`

**totalCycles** number

Total billing cycles

Example:`12`

**setupFee** number

Setup fee

Example:`25`

**shippingOptions** object

Shipping options

**weight** object

Weight options of the product

**value** numberrequired

Actual weight of the product

Example:`10`

**unit** stringrequired

Weight unit of the product

**Possible values:** \[`kg`, `lb`, `g`, `oz`\]

Example:`kg`

**dimensions** object

Dimensions of the product

**height** numberrequired

Height of the price

Example:`10`

**width** numberrequired

Width of the price

Example:`10`

**length** numberrequired

Length of the price

Example:`10`

**unit** stringrequired

Unit of the price dimensions

**Possible values:** \[`cm`, `in`, `m`\]

Example:`cm`

**recurring** object

Recurring details

**interval** stringrequired

The interval at which the recurring event occurs.

**Possible values:** \[`day`, `month`, `week`, `year`\]

Example:`day`

**intervalCount** numberrequired

The number of intervals between each occurrence of the event.

Example:`1`

*   \]
    

**collectionIds** string\[\]

Collection IDs

Example:`["64a1b2c3d4e5f67890123458","64a1b2c3d4e5f67890123459"]`

**isLabelEnabled** boolean

Enable product label

Example:`true`

**isTaxesEnabled** boolean

Enable taxes

Example:`true`

**seo** object

SEO metadata for the product

**title** string

SEO title

Example:`Best Product - Buy Now`

**description** string

SEO description

Example:`This is the best product you can buy online with amazing features and great value`

**slug** string

Product URL slug

Example:`premium-product`

**automaticTaxCategoryId** string

Automatic tax category ID

Example:`64a1b2c3d4e5f67890123460`

**taxInclusive** boolean

Tax inclusive pricing

Example:`false`

**taxes** object\[\]

Product taxes

**medias** object\[\]

Product media

**label** object

Product label

*   \]
    

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   422

Products and prices updated successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**message** stringrequired

Success message

Example:`Products updated successfully`

**status** booleanrequired

Operation status

Example:`true`

**updatedCount** numberrequired

Number of products updated

Example:`5`

```
{  "message": "Products updated successfully",  "status": true,  "updatedCount": 5}
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
curl -L 'https://services.leadconnectorhq.com/products/bulk-update/edit' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-d '{  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "products": [    {      "_id": "64a1b2c3d4e5f67890123456",      "name": "Premium Product",      "description": "A high-quality premium product with excellent features and durability",      "image": "https://example.com/product-image.jpg",      "availableInStore": true,      "prices": [        {          "_id": "64a1b2c3d4e5f67890123456",          "name": "Standard Plan",          "amount": 99.99,          "currency": "USD",          "compareAtPrice": 129.99,          "availableQuantity": 100,          "trackInventory": true,          "allowOutOfStockPurchases": false,          "sku": "SKU-001",          "trialPeriod": 7,          "totalCycles": 12,          "setupFee": 25,          "shippingOptions": {            "weight": {              "value": 10,              "unit": "kg"            },            "dimensions": {              "height": 10,              "width": 10,              "length": 10,              "unit": "cm"            }          },          "recurring": {            "interval": "day",            "intervalCount": 1          }        }      ],      "collectionIds": [        "64a1b2c3d4e5f67890123458",        "64a1b2c3d4e5f67890123459"      ],      "isLabelEnabled": true,      "isTaxesEnabled": true,      "seo": {        "title": "Best Product - Buy Now",        "description": "This is the best product you can buy online with amazing features and great value"      },      "slug": "premium-product",      "automaticTaxCategoryId": "64a1b2c3d4e5f67890123460",      "taxInclusive": false,      "taxes": [        {}      ],      "medias": [        {}      ],      "label": {}    }  ]}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Parameters

Version — headerrequired

\---2021-07-28

Body required

{
  "altId": "6578278e879ad2646715ba9c",  "altType": "location",  "products": \[    {      "\_id": "64a1b2c3d4e5f67890123456",      "name": "Premium Product",      "description": "A high-quality premium product with excellent features and durability",      "image": "https://example.com/product-image.jpg",      "availableInStore": true,      "prices": \[        {          "\_id": "64a1b2c3d4e5f67890123456",          "name": "Standard Plan",          "amount": 99.99,          "currency": "USD",          "compareAtPrice": 129.99,          "availableQuantity": 100,          "trackInventory": true,          "allowOutOfStockPurchases": false,          "sku": "SKU-001",          "trialPeriod": 7,          "totalCycles": 12,          "setupFee": 25,          "shippingOptions": {            "weight": {              "value": 10,              "unit": "kg"            },            "dimensions": {              "height": 10,              "width": 10,              "length": 10,              "unit": "cm"            }          },          "recurring": {            "interval": "day",            "intervalCount": 1          }        }      \],      "collectionIds": \[        "64a1b2c3d4e5f67890123458",        "64a1b2c3d4e5f67890123459"      \],      "isLabelEnabled": true,      "isTaxesEnabled": true,      "seo": {        "title": "Best Product - Buy Now",        "description": "This is the best product you can buy online with amazing features and great value"      },      "slug": "premium-product",      "automaticTaxCategoryId": "64a1b2c3d4e5f67890123460",      "taxInclusive": false,      "taxes": \[        {}      \],      "medias": \[        {}      \],      "label": {}    }  \]
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
