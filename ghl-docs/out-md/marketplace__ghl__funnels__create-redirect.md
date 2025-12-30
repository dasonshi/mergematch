# https://marketplace.gohighlevel.com/docs/ghl/funnels/create-redirect

# Create Redirect

POST 

## https://services.leadconnectorhq.com/funnels/lookup/redirect

The "Create Redirect" API Allows adding a new url redirect to the system. Use this endpoint to create a url redirect with the specified details. Ensure that the required information is provided in the request payload.

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

*   application/json

### Body**required**

**locationId** stringrequired

Example:`6p2RxpgtMKQwO3E6IUaT`

**domain** stringrequired

Example:`example.com`

**path** stringrequired

Example:`/Hello`

**target** stringrequired

Example:`https://www.google.com`

**action** stringrequired

**Possible values:** \[`funnel`, `website`, `url`, `all`\]

Example:`URL`

## Responses[​](#responses "Direct link to Responses")

*   200
*   422

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**data** object

Data containing details of the created redirect

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
curl -L 'https://services.leadconnectorhq.com/funnels/lookup/redirect' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationId": "6p2RxpgtMKQwO3E6IUaT",  "domain": "example.com",  "path": "/Hello",  "target": "https://www.google.com",  "action": "URL"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

Version — headerrequired

\---2021-07-28

Body required

{
  "locationId": "6p2RxpgtMKQwO3E6IUaT",  "domain": "example.com",  "path": "/Hello",  "target": "https://www.google.com",  "action": "URL"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
