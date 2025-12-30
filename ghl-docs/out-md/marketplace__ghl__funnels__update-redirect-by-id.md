# https://marketplace.gohighlevel.com/docs/ghl/funnels/update-redirect-by-id

# Update Redirect By Id

PATCH 

## https://services.leadconnectorhq.com/funnels/lookup/redirect/:id

The "Update Redirect By Id" API Allows updating an existing URL redirect in the system. Use this endpoint to modify a URL redirect with the specified ID using details provided in the request payload.

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

*   application/json

### Body**required**

**target** stringrequired

Example:`https://www.google.com`

**action** stringrequired

**Possible values:** \[`funnel`, `website`, `url`, `all`\]

Example:`URL`

**locationId** stringrequired

Example:`6p2RxpgtMKQwO3E6IUaT`

## Responses[​](#responses "Direct link to Responses")

*   200
*   422

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**data** object

Data containing details of the updated redirect

**id** stringrequired

Unique identifier of the redirect

Example:`6p2RxpgtMKQwO3E6IUaT`

**locationId** stringrequired

Identifier of the location associated with the redirect

Example:`6p2RxpgtMKQwO3E6IUaT`

**domain** stringrequired

Domain where the redirect occurs

Example:`www.example.com`

**path** stringrequired

Original path that will be redirected

Example:`/old-path`

**pathLowercase** stringrequired

Lowercase version of the original path

Example:`/old-path`

**type** stringrequired

Type of redirect (e.g., Permanent, Temporary)

Example:`Permanent`

**target** stringrequired

Target URL to which the original path will be redirected

Example:`https://www.example.com/new-path`

**action** stringrequired

Action performed by the redirect

Example:`url`

```
{  "data": {    "id": "6p2RxpgtMKQwO3E6IUaT",    "locationId": "6p2RxpgtMKQwO3E6IUaT",    "domain": "www.example.com",    "path": "/old-path",    "pathLowercase": "/old-path",    "type": "Permanent",    "target": "https://www.example.com/new-path",    "action": "url"  }}
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
curl -L -X PATCH 'https://services.leadconnectorhq.com/funnels/lookup/redirect/:id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "target": "https://www.google.com",  "action": "URL",  "locationId": "6p2RxpgtMKQwO3E6IUaT"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

id — pathrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "target": "https://www.google.com",  "action": "URL",  "locationId": "6p2RxpgtMKQwO3E6IUaT"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
