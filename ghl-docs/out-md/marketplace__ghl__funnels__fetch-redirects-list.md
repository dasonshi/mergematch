# https://marketplace.gohighlevel.com/docs/ghl/funnels/fetch-redirects-list

# Fetch List of Redirects

GET 

## https://services.leadconnectorhq.com/funnels/lookup/redirect/list

Retrieves a list of all URL redirects based on the given query parameters.

### Requirements

#### Scope(s)

`funnels/redirect.readonly`

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

**locationId** stringrequired

Example: 6p2RxpgtMKQwO3E6IUaT

**limit** numberrequired

Example: 20

**offset** numberrequired

Example: 10

**search** string

Example: example.com/test

## Responses[​](#responses "Direct link to Responses")

*   200
*   422

Successful response - List of URL redirects returned

*   application/json

*   Schema
*   Example (auto)

**Schema**

**data** objectrequired

Object containing the count of redirects and an array of redirect data

Example:`{"count":42,"data":[]}`

```
{  "data": {    "count": 42,    "data": []  }}
```

Unprocessable Entity - The provided data is invalid or incomplete

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/funnels/funnels-api#authentication)**type:** http**scopes:** `funnels/redirect.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/funnels/lookup/redirect/list' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — queryrequired

limit — queryrequired

offset — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

search — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
