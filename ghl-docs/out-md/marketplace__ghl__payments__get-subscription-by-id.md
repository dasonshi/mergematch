# https://marketplace.gohighlevel.com/docs/ghl/payments/get-subscription-by-id

# Get Subscription by ID

GET 

## https://services.leadconnectorhq.com/payments/subscriptions/:subscriptionId

The "Get Subscription by ID" API allows to retrieve information for a specific subscription using its unique identifier. Use this endpoint to fetch details for a single subscription based on the provided subscription ID.

### Requirements

#### Scope(s)

`payments/subscriptions.readonly`

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

**subscriptionId** stringrequired

ID of the subscription that needs to be returned

Example: 6322e9c9e39fc14ab3ed7042

### Query Parameters

**altId** stringrequired

AltId is the unique identifier e.g: location id.

Example: 3SwdhCu3svxI8AKsPJt6

**altType** stringrequired

**Possible values:** \[`location`\]

AltType is the type of identifier.

Example: location

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

The unique identifier for the subscription.

Example:`64bf78af39118e4011926cba`

**altType** objectrequired

AltType is the type of identifier.

Example:`location`

**altId** stringrequired

AltId is the unique identifier eg: location id.

Example:`3SwdhCu3svxI8AKsPJt6`

**contactId** string

Contact id corresponding to the subscription.

Example:`XPLSw2SVagl12LMDeTmQ`

**contactSnapshot** object

Contact details of the subscriber.

Example:`{ last_name: "Mcclain", type: "lead", first_name_lower_case: "rogan", email: "anish+11@gohighlevel.com", last_name_lower_case: "mcclain", location_id: "o6241QsiRwUIJHyjuhos", company_name: "Jordan and Cox Trading"}`

**coupon** object

Coupon details of the subscription.

Example:`{ _id: "6374c6926d119a393fe1e556", usageCount: 5260, altId: "jVFIxsMY19D94nOSIOEO", altType: "location", name: "FREE-100%", code: "FREE100", discountType: "percentage", discountValue: 100 }`

**currency** string

Currency in which subscription was made.

Example:`USD`

**amount** number

Subscription value.

Example:`100`

**status** object

Subscription status.

Example:`active`

**liveMode** boolean

Subscription is in live / test mode.

Example:`false`

**entityType** string

Entity type of subscription (eg: order).

Example:`order`

**entityId** string

Entity id for the subscription. e.g: order id

Example:`62f4db0f3059ecee61379012`

**entitySource** object

Entity source details for the subscription.

**type** stringrequired

**Possible values:** \[`funnel`, `website`, `invoice`, `calendar`, `text2Pay`, `document_contracts`, `membership`, `mobile_app`, `communities`, `point_of_sale`, `manual`, `form`, `survey`, `payment_link`, `external`\]

**subType** string

**Possible values:** \[`one_step_order_form`, `two_step_order_form`, `upsell`, `tap_to_pay`, `card_payment`, `store`, `contact_view`, `email_campaign`, `payments_dashboard`, `shopify`, `subscription_view`, `store_upsell`, `woocommerce`, `service`, `meeting`, `imported_csv`, `qr_code`, `saas_one_time`, `saas_subscription`\]

**id** stringrequired

**name** string

**meta** object

**subscriptionId** string

Subscription id for subscription.

Example:`I-0UE609H8E43P`

**subscriptionSnapshot** object

Snapshot of subscription.

Example:`{ status: "ACTIVE", status_update_time: "2022-08-16T11:06:53Z", id: "I-0UE609H8E43P", plan_id: "P-82K11750F0313430KMLRGE6Y", start_time: "2022-08-16T11:05:31Z", quantity: 1 }`

**paymentProvider** object

Payment provider details for the subscription.

Example:`{ type: "paypal", connectedAccount: { _id: "64410debdc8f3b0503523abb", merchantClientId: "AeXtjrxdgsJiCPwQt5jML5pH-0mwmLs-tH7ub4Uo3IrDKvRl34FvJy8niI6E1wmS_pryIRdNllyVl58b" } }`

**ipAddress** string

Ip address from where subscription was initiated.

Example:`103.100.16.82`

**createdAt** date-timerequired

The creation timestamp of the subscription.

Example:`2023-11-20T10:23:36.515Z`

**updatedAt** date-timerequired

The last update timestamp of the subscription.

Example:`2024-01-23T09:57:04.846Z`

**meta** object

Meta details of the subscription.

Example:`{ collection: "transactionsv2", id: "6320652f0f664b6632006920" }`

**markAsTest** boolean

Is test subscription.

Example:`false`

**schedule** object

Scedule details for the subscription.

**executeAt** string

**rrule** object

**intervalType** stringrequired

**Possible values:** \[`yearly`, `monthly`, `weekly`, `daily`, `hourly`, `minutely`, `secondly`\]

Example:`monthly`

**interval** numberrequired

Example:`2`

**startDate** stringrequired

Start date in YYYY-MM-DD format

Example:`2023-01-01`

**startTime** string

Start time in HH:mm:ss format

Example:`20:45:00`

**endDate** string

End date in YYYY-MM-DD format

Example:`2029-11-01`

**endTime** string

End time in HH:mm:ss format

Example:`18:45:00`

**dayOfMonth** number

\-1, 1, 2, 3, ..., 27, 28

Example:`15`

**dayOfWeek** string

**Possible values:** \[`mo`, `tu`, `we`, `th`, `fr`, `sa`, `su`\]

Example:`mo`

**numOfWeek** number

\-1, 1, 2, 3, 4

Example:`-1`

**monthOfYear** string

**Possible values:** \[`jan`, `feb`, `mar`, `apr`, `may`, `jun`, `jul`, `aug`, `sep`, `oct`, `nov`, `dec`\]

Example:`jan`

**count** number

Max number of task executions

Example:`10`

**daysBefore** number

Execute task number of days before

Example:`5`

**autoPayment** object

Auto payment details of the subscription.

Example:`{ customerId: "908879612", paymentMethodId: "908646635" }`

**recurringProduct** object

Recurring product details of the subscription.

Example:`{ locationId: "Z4Bxl8J4SaPEPLq9IQ8g", funnel: "bQHJWKcyjiKjk4BHv91g", step: "2281a993-8a75-4b48-9912-571f29c99a74", name: "Sofa Set" }`

**canceledAt** date-time

Cancellation timestamp of the subscription.

Example:`2023-11-20T10:23:36.515Z`

**canceledBy** string

User id who cancelled the subscription.

Example:`qUuXUiB2AiA2DIthEicP`

**traceId** string

Trace id of the subscription.

Example:`302d2cf4-1ba0-4bf5-bc3b-f8fa76fda58a`

```
{  "_id": "64bf78af39118e4011926cba",  "altType": "location",  "altId": "3SwdhCu3svxI8AKsPJt6",  "contactId": "XPLSw2SVagl12LMDeTmQ",  "contactSnapshot": "{ last_name: \"Mcclain\", type: \"lead\", first_name_lower_case: \"rogan\", email: \"anish+11@gohighlevel.com\", last_name_lower_case: \"mcclain\", location_id: \"o6241QsiRwUIJHyjuhos\", company_name: \"Jordan and Cox Trading\"}",  "coupon": "{ _id: \"6374c6926d119a393fe1e556\", usageCount: 5260, altId: \"jVFIxsMY19D94nOSIOEO\", altType: \"location\", name: \"FREE-100%\", code: \"FREE100\", discountType: \"percentage\", discountValue: 100 }",  "currency": "USD",  "amount": "100",  "status": "active",  "liveMode": "false",  "entityType": "order",  "entityId": "62f4db0f3059ecee61379012",  "entitySource": "{ type: \"funnel\", id: \"lx6ROqruHGVQD2PZwFxK\", subType: \"upsell\", name: \"test funnel\" }",  "subscriptionId": "I-0UE609H8E43P",  "subscriptionSnapshot": "{ status: \"ACTIVE\", status_update_time: \"2022-08-16T11:06:53Z\", id: \"I-0UE609H8E43P\", plan_id: \"P-82K11750F0313430KMLRGE6Y\", start_time: \"2022-08-16T11:05:31Z\", quantity: 1 }",  "paymentProvider": "{ type: \"paypal\", connectedAccount: { _id: \"64410debdc8f3b0503523abb\", merchantClientId: \"AeXtjrxdgsJiCPwQt5jML5pH-0mwmLs-tH7ub4Uo3IrDKvRl34FvJy8niI6E1wmS_pryIRdNllyVl58b\" } }",  "ipAddress": "103.100.16.82",  "createdAt": "2023-11-20T10:23:36.515Z",  "updatedAt": "2024-01-23T09:57:04.846Z",  "meta": "{ collection: \"transactionsv2\", id: \"6320652f0f664b6632006920\" }",  "markAsTest": "false",  "schedule": "{ collection: \"transactionsv2\", id: \"6320652f0f664b6632006920\" }",  "autoPayment": "{ customerId: \"908879612\", paymentMethodId: \"908646635\" }",  "recurringProduct": "{ locationId: \"Z4Bxl8J4SaPEPLq9IQ8g\", funnel: \"bQHJWKcyjiKjk4BHv91g\", step: \"2281a993-8a75-4b48-9912-571f29c99a74\", name: \"Sofa Set\" }",  "canceledAt": "2023-11-20T10:23:36.515Z",  "canceledBy": "qUuXUiB2AiA2DIthEicP",  "traceId": "302d2cf4-1ba0-4bf5-bc3b-f8fa76fda58a"}
```

Subscription not found

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

**name:** [Authorization](/docs/ghl/payments/payments-api#authentication)**type:** http**scopes:** `payments/subscriptions.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/payments/subscriptions/:subscriptionId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

subscriptionId — pathrequired

altId — queryrequired

altType — queryrequired

\---location

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
