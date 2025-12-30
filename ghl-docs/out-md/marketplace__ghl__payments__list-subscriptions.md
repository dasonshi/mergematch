# https://marketplace.gohighlevel.com/docs/ghl/payments/list-subscriptions

# List Subscriptions

GET 

## https://services.leadconnectorhq.com/payments/subscriptions

The "List Subscriptions" API allows to retrieve a paginated list of subscriptions. Customize your results by filtering subscriptions based on name, alt type, subscription status, payment mode, date range, type of source, contact, subscription id, entity id, contact or paginate through the list using the provided query parameters. This endpoint provides a straightforward way to explore and retrieve subscription information.

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

### Query Parameters

**altId** stringrequired

AltId is the unique identifier e.g: location id.

Example: 3SwdhCu3svxI8AKsPJt6

**altType** stringrequired

**Possible values:** \[`location`\]

AltType is the type of identifier.

Example: location

**entityId** string

Entity id for filtering of subscriptions.

Example: 61dd0fe9c077f73e67f78803

**paymentMode** string

Mode of payment.

Example: live

**startAt** string

Starting interval of subscriptions.

Example: 2024-02-01

**endAt** string

Closing interval of subscriptions.

Example: 2024-02-13

**entitySourceType** string

Source of the subscriptions.

Example: funnel

**search** string

The name of the subscription for searching.

Example: Awesome subscription

**contactId** string

Contact ID for the subscription

Example: AmuzcoPBpgKeccNsFlib

**id** string

Subscription id for filtering of subscriptions.

Example: 64bf78af39118e4011926cba

**limit** number

The maximum number of items to be included in a single page of results

Default value:`10`

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

**data** object\[\]required

An array of subscriptions

*   Array \[
    

**\_id** stringrequired

The unique identifier for the subscription.

Example:`64bf78af39118e4011926cba`

**altId** stringrequired

AltId is the unique identifier eg: location id.

Example:`3SwdhCu3svxI8AKsPJt6`

**altType** stringrequired

AltType is the type of identifier.

**Possible values:** \[`location`\]

Example:`location`

**contactId** string

Contact id corresponding to the subscription.

Example:`XPLSw2SVagl12LMDeTmQ`

**contactName** string

Contact name corresponding to the subscription.

Example:`James Bond`

**contactEmail** string

Contact email corresponding to the subscription.

Example:`james.bond@gohighlevel.com`

**currency** string

Currency in which subscription occurred.

Example:`USD`

**amount** number

Subscription value.

Example:`100`

**status** objectrequired

The status of the subscription (e.g., succeeded).

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

**entitySourceType** stringrequired

Entity source type of subscription (eg: funnel).

Example:`funnel`

**entitySourceName** string

Entity source name for the subscription.

Example:`Attribution Funnel`

**entitySourceId** string

Entity source id for the subscription.

Example:`bevrkPbLaDNXFaqfLKMm`

**entitySourceMeta** object

Meta content for the entity source of subscription.

Example:`{ domain: "app.gohighlevel.com", pageId: "sxC4lNhFIavEnLZh5KhC", pageUrl: "/v2/preview/sxC4lNhFIavEnLZh5KhC", stepId: "7d303d1f-cb85-403d-b548-bf01de5c7bb0" }`

**subscriptionId** string

Subscription id for subscription.

Example:`I-0UE609H8E43P`

**subscriptionSnapshot** object

Snapshot of subscription.

Example:`{ status: "ACTIVE", status_update_time: "2022-08-16T11:06:53Z", id: "I-0UE609H8E43P", plan_id: "P-82K11750F0313430KMLRGE6Y", start_time: "2022-08-16T11:05:31Z", quantity: 1 }`

**paymentProviderType** string

Payment provider for subscription.

Example:`stripe`

**paymentProviderConnectedAccount** string

Payment provider connected account id for subscription.

Example:`ATn0CqrzrWS5ak185Bsb1xCpyzBDOZ8WdRxyFotppLYePTDhiuQ49H5QXO_L-4HKk1GBn7f9_QhbNK2s`

**ipAddress** string

Ip address from where subscription was initiated.

Example:`103.100.16.82`

**createdAt** date-timerequired

The creation timestamp of the subscription.

Example:`2023-11-20T10:23:36.515Z`

**updatedAt** date-timerequired

The update timestamp of the subscription.

Example:`2023-11-20T10:23:36.515Z`

*   \]
    

**totalCount** numberrequired

total subscriptions count

```
{  "data": [    {      "_id": "64bf78af39118e4011926cba",      "altId": "3SwdhCu3svxI8AKsPJt6",      "altType": "location",      "contactId": "XPLSw2SVagl12LMDeTmQ",      "contactName": "James Bond",      "contactEmail": "james.bond@gohighlevel.com",      "currency": "USD",      "amount": "100",      "status": "active",      "liveMode": "false",      "entityType": "order",      "entityId": "62f4db0f3059ecee61379012",      "entitySourceType": "funnel",      "entitySourceName": "Attribution Funnel",      "entitySourceId": "bevrkPbLaDNXFaqfLKMm",      "entitySourceMeta": "{ domain: \"app.gohighlevel.com\", pageId:  \"sxC4lNhFIavEnLZh5KhC\", pageUrl:  \"/v2/preview/sxC4lNhFIavEnLZh5KhC\", stepId: \"7d303d1f-cb85-403d-b548-bf01de5c7bb0\" }",      "subscriptionId": "I-0UE609H8E43P",      "subscriptionSnapshot": "{ status: \"ACTIVE\", status_update_time: \"2022-08-16T11:06:53Z\", id: \"I-0UE609H8E43P\", plan_id: \"P-82K11750F0313430KMLRGE6Y\", start_time: \"2022-08-16T11:05:31Z\", quantity: 1 }",      "paymentProviderType": "stripe",      "paymentProviderConnectedAccount": "ATn0CqrzrWS5ak185Bsb1xCpyzBDOZ8WdRxyFotppLYePTDhiuQ49H5QXO_L-4HKk1GBn7f9_QhbNK2s",      "ipAddress": "103.100.16.82",      "createdAt": "2023-11-20T10:23:36.515Z",      "updatedAt": "2023-11-20T10:23:36.515Z"    }  ],  "totalCount": 0}
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
curl -L 'https://services.leadconnectorhq.com/payments/subscriptions' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

altId — queryrequired

altType — queryrequired

\---location

Version — headerrequired

\---2021-07-28

Show optional parameters

entityId — query

paymentMode — query

startAt — query

endAt — query

entitySourceType — query

search — query

contactId — query

id — query

limit — query

offset — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
