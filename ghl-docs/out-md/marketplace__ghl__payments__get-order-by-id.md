# https://marketplace.gohighlevel.com/docs/ghl/payments/get-order-by-id

# Get Order by ID

GET 

## https://services.leadconnectorhq.com/payments/orders/:orderId

The "Get Order by ID" API allows to retrieve information for a specific order using its unique identifier. Use this endpoint to fetch details for a single order based on the provided order ID.

### Requirements

#### Scope(s)

`payments/orders.readonly`

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

**orderId** stringrequired

ID of the order that needs to be returned

Example: 653f5e0cde5a1314e62a837c

### Query Parameters

**locationId** string

LocationId is the id of the sub-account.

Example: 3SwdhCu3svxI8AKsPJt6

**altId** stringrequired

AltId is the unique identifier e.g: location id.

Example: 3SwdhCu3svxI8AKsPJt6

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

The unique identifier for the order.

Example:`653f5e0cde5a1314e62a837c`

**altId** stringrequired

AltId is the unique identifier eg: location id.

Example:`3SwdhCu3svxI8AKsPJt6`

**altType** stringrequired

AltType is the type of identifier.

Example:`location`

**contactId** string

Contact id corresponding to the order.

Example:`XPLSw2SVagl12LMDeTmQ`

**currency** string

Currency in which order was created.

Example:`USD`

**amount** number

Order value.

Example:`100`

**status** stringrequired

The status of the order (e.g., completed).

Example:`completed`

**liveMode** boolean

Order is in live / test mode.

Example:`false`

**createdAt** date-timerequired

The creation timestamp of the order.

Example:`2023-11-20T10:23:36.515Z`

**updatedAt** date-timerequired

The last update timestamp of the order.

Example:`2024-01-23T09:57:04.846Z`

**fulfillmentStatus** string

Fulfillment status of the order.

Example:`unfulfilled`

**contactSnapshot** object

Contact details of the order.

Example:`{ last_name: "Mcclain", type: "lead", first_name_lower_case: "rogan", email: "anish+11@gohighlevel.com", last_name_lower_case: "mcclain", location_id: "o6241QsiRwUIJHyjuhos", company_name: "Jordan and Cox Trading"}`

**amountSummary** object

Amount details of the order.

**subtotal** numberrequired

Order sub-total value.

Example:`100`

**discount** number

Discount value on order.

Example:`10`

**source** object

Source details of the order.

**type** stringrequired

**Possible values:** \[`funnel`, `website`, `invoice`, `calendar`, `text2Pay`, `document_contracts`, `membership`, `mobile_app`, `communities`, `point_of_sale`, `manual`, `form`, `survey`, `payment_link`, `external`\]

**subType** string

**Possible values:** \[`one_step_order_form`, `two_step_order_form`, `upsell`, `tap_to_pay`, `card_payment`, `store`, `contact_view`, `email_campaign`, `payments_dashboard`, `shopify`, `subscription_view`, `store_upsell`, `woocommerce`, `service`, `meeting`, `imported_csv`, `qr_code`, `saas_one_time`, `saas_subscription`\]

**id** stringrequired

**name** string

**meta** object

**items** string\[\]

Item details of the order.

Example:`{ _id: 61dd33e88058b9f967ca79dc, authorizeAmount: 0, locationId: "SBAWb4yu7A4LSc0skQ6g", name: "Sample Product": price: {}, product: { name: "Testing product", productType: "SERVICE" }}`

**coupon** object

Coupon details of the order.

Example:`{ code: "FEST10", _id: "63455e48901b43d4ef364a20" }`

**trackingId** string

Tracking id of the order.

Example:`63319ef9-de0a-4c84-aebd-3585fb4a0cdf`

**fingerprint** string

Fingerprint id of the order.

Example:`5d51db5a-42b0-4b04-ba88-2c046c982a3a`

**meta** object

Meta details of the order.

Example:`{ couponSessionExpired: true }`

**markAsTest** boolean

Is test order.

Example:`false`

**traceId** string

Trace id of the order.

Example:`d3b16a92-a8ed-4e6b-8467-844750f78ed5`

**automaticTaxesCalculated** boolean

Automatic taxes applied for the Order

Example:`true`

**taxCalculationProvider** object

Provider name for automatic tax calculation

Example:`taxjar`

```
{  "_id": "653f5e0cde5a1314e62a837c",  "altId": "3SwdhCu3svxI8AKsPJt6",  "altType": "location",  "contactId": "XPLSw2SVagl12LMDeTmQ",  "currency": "USD",  "amount": "100",  "status": "completed",  "liveMode": "false",  "createdAt": "2023-11-20T10:23:36.515Z",  "updatedAt": "2024-01-23T09:57:04.846Z",  "fulfillmentStatus": "unfulfilled",  "contactSnapshot": "{ last_name: \"Mcclain\", type: \"lead\", first_name_lower_case: \"rogan\", email: \"anish+11@gohighlevel.com\", last_name_lower_case: \"mcclain\", location_id: \"o6241QsiRwUIJHyjuhos\", company_name: \"Jordan and Cox Trading\"}",  "amountSummary": "{ subtotal: 100, discount: 5 }",  "source": "{ type: \"invoice\", id: \"61dd48ff65b013bc39bb09c6\" }",  "items": "{ _id: 61dd33e88058b9f967ca79dc, authorizeAmount: 0, locationId: \"SBAWb4yu7A4LSc0skQ6g\", name: \"Sample Product\": price: {}, product: { name: \"Testing product\", productType: \"SERVICE\" }}",  "coupon": "{ code: \"FEST10\", _id: \"63455e48901b43d4ef364a20\" }",  "trackingId": "63319ef9-de0a-4c84-aebd-3585fb4a0cdf",  "fingerprint": "5d51db5a-42b0-4b04-ba88-2c046c982a3a",  "meta": "{ couponSessionExpired: true }",  "markAsTest": "false",  "traceId": "d3b16a92-a8ed-4e6b-8467-844750f78ed5",  "automaticTaxesCalculated": true,  "taxCalculationProvider": "taxjar"}
```

Order not found

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

**name:** [Authorization](/docs/ghl/payments/payments-api#authentication)**type:** http**scopes:** `payments/orders.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/payments/orders/:orderId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

orderId — pathrequired

altId — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

locationId — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
