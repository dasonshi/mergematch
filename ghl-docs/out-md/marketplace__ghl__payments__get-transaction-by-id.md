# https://marketplace.gohighlevel.com/docs/ghl/payments/get-transaction-by-id

# Get Transaction by ID

GET 

## https://services.leadconnectorhq.com/payments/transactions/:transactionId

The "Get Transaction by ID" API allows to retrieve information for a specific transaction using its unique identifier. Use this endpoint to fetch details for a single transaction based on the provided transaction ID.

### Requirements

#### Scope(s)

`payments/transactions.readonly`

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

**transactionId** stringrequired

ID of the transaction that needs to be returned

Example: 61dd0feac077f72010f78804

### Query Parameters

**locationId** string

LocationId is the id of the sub-account.

Example: 3SwdhCu3svxI8AKsPJt6

**altId** stringrequired

AltId is the unique identifier e.g: location id.

Example: 3SwdhCu3svxI8AKsPJt6

**altType** stringrequired

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

The unique identifier for the transaction.

Example:`61dd0feac077f72010f78804`

**altType** stringrequired

AltType is the type of identifier.

Example:`location`

**altId** stringrequired

AltId is the unique identifier eg: location id.

Example:`3SwdhCu3svxI8AKsPJt6`

**contactId** string

Contact id corresponding to the transaction.

Example:`XPLSw2SVagl12LMDeTmQ`

**contactSnapshot** object

Contact details of the transaction.

Example:`{ last_name: "Mcclain", type: "lead", first_name_lower_case: "rogan", email: "anish+11@gohighlevel.com", last_name_lower_case: "mcclain", location_id: "o6241QsiRwUIJHyjuhos", company_name: "Jordan and Cox Trading"}`

**currency** string

Currency in which transaction was made.

Example:`USD`

**amount** number

Transaction value.

Example:`100`

**status** object

Transaction status.

Example:`succeeded`

**liveMode** boolean

Transaction is in live / test mode.

Example:`false`

**createdAt** date-timerequired

The creation timestamp of the transaction.

Example:`2023-11-20T10:23:36.515Z`

**updatedAt** date-timerequired

The last update timestamp of the transaction.

Example:`2024-01-23T09:57:04.846Z`

**entityType** string

Entity type of transaction (eg: order).

Example:`order`

**entityId** string

Entity id for the transaction. e.g: order id

Example:`61dd0fe9c077f73e67f78803`

**entitySource** object

Entity source details for the transaction.

**type** stringrequired

**Possible values:** \[`funnel`, `website`, `invoice`, `calendar`, `text2Pay`, `document_contracts`, `membership`, `mobile_app`, `communities`, `point_of_sale`, `manual`, `form`, `survey`, `payment_link`, `external`\]

**subType** string

**Possible values:** \[`one_step_order_form`, `two_step_order_form`, `upsell`, `tap_to_pay`, `card_payment`, `store`, `contact_view`, `email_campaign`, `payments_dashboard`, `shopify`, `subscription_view`, `store_upsell`, `woocommerce`, `service`, `meeting`, `imported_csv`, `qr_code`, `saas_one_time`, `saas_subscription`\]

**id** stringrequired

**name** string

**meta** object

**chargeId** string

Charge id for transaction.

Example:`in_1KGcXDCScnf89tZohCsmImwE`

**chargeSnapshot** object

Charge snapshot of transaction.

Example:`{ id: "in_1KGcXDCScnf89tZohCsmImwE", object: "invoice", account_country: "US", account_name: "GHL-Testing" }`

**invoiceId** string

Invoice id for the transaction.

Example:`in_1KGcXDCScnf89tZohCsmImwE`

**subscriptionId** string

Subscription id for transaction.

Example:`sub_1KGcXDCScnf89tZoVkoEMCEL`

**paymentProvider** object

Payment provider details of the transaction.

Example:`{ type: "stripe", connectedAccount: { _id: "612ca676b484b241fef9d962", accountId: "acct_1Ihw53CScnf89tZo" } }`

**ipAddress** string

Ip address from where transaction was initiated.

Example:`107.178.194.224`

**meta** object

Meta details of the transaction.

Example:`{ stepId: "af7c731e-e36f-4152-bd1a-3f69a31d6d6d", pageId: "A8ltotc2jZxurJba4e3Y", pageUrl: "/v2/preview/A8ltotc2jZxurJba4e3Y" }`

**markAsTest** boolean

Is test transaction.

Example:`false`

**isParent** boolean

Is parent transaction.

Example:`false`

**amountRefunded** number

Transaction amount refunded.

Example:`10`

**receiptId** string

Receipt id for transaction.

Example:`6492fbea489bc07892c6defb`

**qboSynced** boolean

Is transaction qbo synced.

Example:`false`

**qboResponse** object

Qbo details of the transaction.

Example:`{ domain: "QBO", sparse: false, Id: "180", SyncToken: "0", TotalAmt: 25 }`

**traceId** string

Trace id of the transaction.

Example:`d3b16a92-a8ed-4e6b-8467-844750f78ed5`

**mergedFromContactId** string

ID of the contact that was merged from.

Example:`XPLSw2SVagl12LMDeTmQ`

```
{  "_id": "61dd0feac077f72010f78804",  "altType": "location",  "altId": "3SwdhCu3svxI8AKsPJt6",  "contactId": "XPLSw2SVagl12LMDeTmQ",  "contactSnapshot": "{ last_name: \"Mcclain\", type: \"lead\", first_name_lower_case: \"rogan\", email: \"anish+11@gohighlevel.com\", last_name_lower_case: \"mcclain\", location_id: \"o6241QsiRwUIJHyjuhos\", company_name: \"Jordan and Cox Trading\"}",  "currency": "USD",  "amount": "100",  "status": "succeeded",  "liveMode": "false",  "createdAt": "2023-11-20T10:23:36.515Z",  "updatedAt": "2024-01-23T09:57:04.846Z",  "entityType": "order",  "entityId": "61dd0fe9c077f73e67f78803",  "entitySource": "{ type: \"funnel\", id: \"BDBMEghdIUaqMPEsK349\", subType: \"two_step_order_form\", name: \"new funnel\" }",  "chargeId": "in_1KGcXDCScnf89tZohCsmImwE",  "chargeSnapshot": "{ id: \"in_1KGcXDCScnf89tZohCsmImwE\", object: \"invoice\", account_country: \"US\",  account_name:  \"GHL-Testing\" }",  "invoiceId": "in_1KGcXDCScnf89tZohCsmImwE",  "subscriptionId": "sub_1KGcXDCScnf89tZoVkoEMCEL",  "paymentProvider": "{ type: \"stripe\", connectedAccount: { _id: \"612ca676b484b241fef9d962\", accountId: \"acct_1Ihw53CScnf89tZo\" } }",  "ipAddress": "107.178.194.224",  "meta": "{ stepId: \"af7c731e-e36f-4152-bd1a-3f69a31d6d6d\", pageId: \"A8ltotc2jZxurJba4e3Y\", pageUrl: \"/v2/preview/A8ltotc2jZxurJba4e3Y\" }",  "markAsTest": "false",  "isParent": "false",  "amountRefunded": "10",  "receiptId": "6492fbea489bc07892c6defb",  "qboSynced": "false",  "qboResponse": "{ domain: \"QBO\", sparse: false, Id: \"180\", SyncToken: \"0\", TotalAmt: 25 }",  "traceId": "d3b16a92-a8ed-4e6b-8467-844750f78ed5",  "mergedFromContactId": "XPLSw2SVagl12LMDeTmQ"}
```

Transaction not found

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

**name:** [Authorization](/docs/ghl/payments/payments-api#authentication)**type:** http**scopes:** `payments/transactions.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/payments/transactions/:transactionId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

transactionId — pathrequired

altId — queryrequired

altType — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

locationId — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
