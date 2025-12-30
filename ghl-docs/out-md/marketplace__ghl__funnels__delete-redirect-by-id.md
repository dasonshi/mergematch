# https://marketplace.gohighlevel.com/docs/ghl/funnels/delete-redirect-by-id

# Delete Redirect By Id

DELETE 

## https://services.leadconnectorhq.com/funnels/lookup/redirect/:id

The "Delete Redirect By Id" API Allows deletion of a URL redirect from the system using its unique identifier. Use this endpoint to delete a URL redirect with the specified ID using details provided in the request payload.

### Requirements

#### Scope(s)

`funnels/redirect.write`

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

**id** stringrequired

### Query Parameters

**locationId** stringrequired

Example: 6p2RxpgtMKQwO3E6IUaT

## Responses[​](#responses "Direct link to Responses")

*   200
*   422

Successful response - URL redirect deleted successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**data** objectrequired

Status of the delete operation

Example:`{"status":"ok"}`

```
{  "data": {    "status": "ok"  }}
```

Unprocessable Entity - The provided data is invalid or incomplete

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/funnels/funnels-api#authentication)**type:** http**scopes:** `funnels/redirect.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X DELETE 'https://services.leadconnectorhq.com/funnels/lookup/redirect/:id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

id — pathrequired

locationId — queryrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
