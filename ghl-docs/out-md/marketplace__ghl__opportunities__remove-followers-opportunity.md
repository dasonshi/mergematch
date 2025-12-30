# https://marketplace.gohighlevel.com/docs/ghl/opportunities/remove-followers-opportunity

# Remove Followers

DELETE 

## https://services.leadconnectorhq.com/opportunities/:id/followers

Remove Followers

### Requirements

#### Scope(s)

`opportunities.write`

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

Opportunity Id

Example: sx6wyHhbFdRXh302Lunr

*   application/json

### Body**required**

**followers** string\[\]required

Example:`["sx6wyHhbFdRXh302Lunr","sx6wyHhbFdRXh302Lunr"]`

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

**followers** string\[\]

Example:`["sx6wyHhbFdRXh302Lunr","sx6wyHhbFdRXh302LLss"]`

**followersRemoved** string\[\]

Example:`["Mx6wyHhbFdRXh302Luer","Ka6wyHhbFdRXh302LLsAm"]`

```
{  "followers": [    "sx6wyHhbFdRXh302Lunr",    "sx6wyHhbFdRXh302LLss"  ],  "followersRemoved": [    "Mx6wyHhbFdRXh302Luer",    "Ka6wyHhbFdRXh302LLsAm"  ]}
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

**name:** [Authorization](/docs/ghl/opportunities/opportunities-api#authentication)**type:** http**scopes:** `opportunities.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X DELETE 'https://services.leadconnectorhq.com/opportunities/:id/followers' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "followers": [    "sx6wyHhbFdRXh302Lunr",    "sx6wyHhbFdRXh302Lunr"  ]}'
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
  "followers": \[    "sx6wyHhbFdRXh302Lunr",    "sx6wyHhbFdRXh302Lunr"  \]
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
