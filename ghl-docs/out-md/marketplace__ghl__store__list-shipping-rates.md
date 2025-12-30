# https://marketplace.gohighlevel.com/docs/ghl/store/list-shipping-rates

# List Shipping Rates

GET 

## https://services.leadconnectorhq.com/store/shipping-zone/:shippingZoneId/shipping-rate

The "List Shipping Rate" API allows to retrieve a list of shipping rate.

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Path Parameters

**shippingZoneId** stringrequired

ID of the item that needs to be returned

Example: 6578278e879ad2646715ba9c

### Query Parameters

**altId** stringrequired

Location Id or Agency Id

Example: 6578278e879ad2646715ba9c

**altType** stringrequired

**Possible values:** \[`location`\]

**limit** number

The maximum number of items to be included in a single page of results

Default value:`0`

Example: 20

**offset** number

The starting index of the page, indicating the position from which the results should be retrieved.

Default value:`0`

Example: 0

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

**total** numberrequired

Total number of items

Example:`20`

**data** object\[\]required

An array of items

*   Array \[
    

**altId** stringrequired

Location Id or Agency Id

Example:`6578278e879ad2646715ba9c`

**altType** stringrequired

**Possible values:** \[`location`\]

**name** stringrequired

Name of the shipping zone

Example:`North zone`

**description** string

Delivery description

Example:`Ships next day`

**currency** stringrequired

The currency of the amount of the rate / handling fee

Example:`USD`

**amount** numberrequired

The amount of the shipping rate if it is normal rate (0 means free ). Fixed Handling fee if it is a carrier rate (it will add to the carrier rate).

Example:`99.99`

**conditionType** stringrequired

Type of condition to provide the conditional pricing

**Possible values:** \[`none`, `price`, `weight`\]

Example:`price`

**minCondition** numberrequired

Minimum condition for applying this price. set 0 or null if there is no minimum

Example:`99.99`

**maxCondition** numberrequired

Maximum condition for applying this price. set 0 or null if there is no maximum

Example:`99.99`

**isCarrierRate** boolean

is this a carrier rate

Example:`true`

**shippingCarrierId** stringrequired

Shipping carrier id

Example:`655b33a82209e60b6adb87a5`

**percentageOfRateFee** number

Percentage of rate fee if it is a carrier rate.

Example:`10.99`

**shippingCarrierServices** object\[\]

An array of items

*   Array \[
    

**name** stringrequired

Name of the shipping carrier service

Example:`Priority Mail Express International`

**value** stringrequired

Value of the shipping carrier service

Example:`PriorityMailExpressInternational`

*   \]
    

**\_id** stringrequired

The unique identifier for the product.

Example:`655b33a82209e60b6adb87a5`

**shippingZoneId** stringrequired

The unique identifier for the shipping zone.

Example:`655b33a82209e60b6adb87a5`

**createdAt** stringrequired

created at

Example:`2023-12-12T09:27:42.355Z`

**updatedAt** stringrequired

updated at

Example:`2023-12-12T09:27:42.355Z`

*   \]
    

```
{  "total": 20,  "data": [    {      "altId": "6578278e879ad2646715ba9c",      "altType": "location",      "name": "North zone",      "description": "Ships next day",      "currency": "USD",      "amount": 99.99,      "conditionType": "price",      "minCondition": 99.99,      "maxCondition": 99.99,      "isCarrierRate": true,      "shippingCarrierId": "655b33a82209e60b6adb87a5",      "percentageOfRateFee": 10.99,      "shippingCarrierServices": [        {          "name": "Priority Mail Express International",          "value": "PriorityMailExpressInternational"        }      ],      "_id": "655b33a82209e60b6adb87a5",      "shippingZoneId": "655b33a82209e60b6adb87a5",      "createdAt": "2023-12-12T09:27:42.355Z",      "updatedAt": "2023-12-12T09:27:42.355Z"    }  ]}
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

**name:** [Authorization](/docs/ghl/store/store-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/store/shipping-zone/:shippingZoneId/shipping-rate' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

shippingZoneId — pathrequired

altId — queryrequired

altType — queryrequired

\---location

Show optional parameters

limit — query

offset — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
