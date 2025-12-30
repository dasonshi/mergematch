# https://marketplace.gohighlevel.com/docs/ghl/funnels/get-pages-by-funnel-id

# Fetch list of funnel pages

GET 

## https://services.leadconnectorhq.com/funnels/page

Retrieves a list of all funnel pages based on the given query parameters.

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Query Parameters

**locationId** stringrequired

**funnelId** stringrequired

**name** string

**limit** numberrequired

**offset** numberrequired

## Responses[​](#responses "Direct link to Responses")

*   200

Successful response - List of funnel pages returned

*   application/json

*   Schema
*   Example (auto)

**Schema**

**\_id** stringrequired

Example:`0yJbP3q7t7pLmeTWRAE2`

**locationId** stringrequired

Example:`ojQjykmwNIU88vfsfzvH`

**funnelId** stringrequired

Example:`iucJ6TdFZiddhq9f6znh`

**name** stringrequired

Example:`Home`

**stepId** stringrequired

Example:`343bf634-3aa6-4ade-b963-2d3cd0bf2ede`

**deleted** stringrequired

Example:`false`

**updatedAt** stringrequired

Example:`2024-04-18T12:25:23.029Z`

```
{  "_id": "0yJbP3q7t7pLmeTWRAE2",  "locationId": "ojQjykmwNIU88vfsfzvH",  "funnelId": "iucJ6TdFZiddhq9f6znh",  "name": "Home",  "stepId": "343bf634-3aa6-4ade-b963-2d3cd0bf2ede",  "deleted": false,  "updatedAt": "2024-04-18T12:25:23.029Z"}
```

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/funnels/funnels-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/funnels/page' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — queryrequired

funnelId — queryrequired

limit — queryrequired

offset — queryrequired

Show optional parameters

name — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
