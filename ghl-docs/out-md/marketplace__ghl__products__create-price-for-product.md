# https://marketplace.gohighlevel.com/docs/ghl/products/create-price-for-product

# Create Price for a Product

POST 

## https://services.leadconnectorhq.com/products/:productId/price

The "Create Price for a Product" API allows adding a new price associated with a specific product to the system. Use this endpoint to create a price with the specified details for a particular product. Ensure that the required information is provided in the request payload.

### Requirements

#### Scope(s)

`products/prices.write`

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

*   application/json

### Body**required**

**name** stringrequired

The name of the price.

Example:`Price Name`

**type** stringrequired

The type of the price.

**Possible values:** \[`one_time`, `recurring`\]

Example:`one_time`

**currency** stringrequired

The currency of the price.

Example:`USD`

**amount** numberrequired

The amount of the price. ( min: 0 )

Example:`99.99`

**recurring** object

The recurring details of the price (if type is recurring).

**interval** stringrequired

The interval at which the recurring event occurs.

**Possible values:** \[`day`, `month`, `week`, `year`\]

Example:`day`

**intervalCount** numberrequired

The number of intervals between each occurrence of the event.

Example:`1`

**description** string

A brief description of the price.

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
    

**trialPeriod** number

The trial period duration in days (if applicable).

Example:`7`

**totalCycles** number

The total number of billing cycles for the price. ( min: 1 )

Example:`12`

**setupFee** number

The setup fee for the price.

Example:`10.99`

**variantOptionIds** string\[\]

An array of variant option IDs associated with the price.

Example:`["option_id_1","option_id_2"]`

**compareAtPrice** number

The compare at price for the price.

Example:`19.99`

**locationId** stringrequired

The unique identifier of the location associated with the price.

Example:`6578278e879ad2646715ba9c`

**userId** string

The unique identifier of the user who created the price.

Example:`6578278e879ad2646715ba9c`

**meta** object

Additional metadata associated with the price.

**source** stringrequired

The source of the price.

**Possible values:** \[`stripe`, `woocommerce`, `shopify`\]

Example:`stripe`

**sourceId** string

The id of the source of the price from where it is imported

Example:`123`

**stripePriceId** stringrequired

The Stripe price ID associated with the price.

Example:`price_123`

**internalSource** stringrequired

The internal source of the price.

**Possible values:** \[`agency_plan`, `funnel`, `membership`, `communities`, `gokollab`, `calendar`\]

Example:`agency_plan`

**trackInventory** boolean

Need to track inventory stock quantity

Example:`true`

**availableQuantity** number

Available inventory stock quantity

Example:`5`

**allowOutOfStockPurchases** boolean

Continue selling when out of stock

Example:`true`

**sku** string

The unique identifier of the SKU associated with the price

Example:`sku_123`

**shippingOptions** object

Shipping options of the Price

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

**isDigitalProduct** boolean

Is the product a digital product

Example:`true`

**digitalDelivery** string\[\]

Digital delivery options

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

**name:** [Authorization](/docs/ghl/products/products-api#authentication)**type:** http**scopes:** `products/prices.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/products/:productId/price' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "Price Name",  "type": "one_time",  "currency": "USD",  "amount": 99.99,  "recurring": {    "interval": "day",    "intervalCount": 1  },  "description": "string",  "membershipOffers": [    {      "label": "top_50",      "value": "50",      "_id": "655b33aa2209e60b6adb87a7"    }  ],  "trialPeriod": 7,  "totalCycles": 12,  "setupFee": 10.99,  "variantOptionIds": [    "option_id_1",    "option_id_2"  ],  "compareAtPrice": 19.99,  "locationId": "6578278e879ad2646715ba9c",  "userId": "6578278e879ad2646715ba9c",  "meta": {    "source": "stripe",    "sourceId": "123",    "stripePriceId": "price_123",    "internalSource": "agency_plan"  },  "trackInventory": true,  "availableQuantity": 5,  "allowOutOfStockPurchases": true,  "sku": "sku_123",  "shippingOptions": {    "weight": {      "value": 10,      "unit": "kg"    },    "dimensions": {      "height": 10,      "width": 10,      "length": 10,      "unit": "cm"    }  },  "isDigitalProduct": true,  "digitalDelivery": [    "string"  ]}'
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

Version — headerrequired

\---2021-07-28

Body required

{
  "name": "Price Name",  "type": "one\_time",  "currency": "USD",  "amount": 99.99,  "recurring": {    "interval": "day",    "intervalCount": 1  },  "description": "string",  "membershipOffers": \[    {      "label": "top\_50",      "value": "50",      "\_id": "655b33aa2209e60b6adb87a7"    }  \],  "trialPeriod": 7,  "totalCycles": 12,  "setupFee": 10.99,  "variantOptionIds": \[    "option\_id\_1",    "option\_id\_2"  \],  "compareAtPrice": 19.99,  "locationId": "6578278e879ad2646715ba9c",  "userId": "6578278e879ad2646715ba9c",  "meta": {    "source": "stripe",    "sourceId": "123",    "stripePriceId": "price\_123",    "internalSource": "agency\_plan"  },  "trackInventory": true,  "availableQuantity": 5,  "allowOutOfStockPurchases": true,  "sku": "sku\_123",  "shippingOptions": {    "weight": {      "value": 10,      "unit": "kg"    },    "dimensions": {      "height": 10,      "width": 10,      "length": 10,      "unit": "cm"    }  },  "isDigitalProduct": true,  "digitalDelivery": \[    "string"  \]
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
