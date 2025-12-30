# https://marketplace.gohighlevel.com/docs/ghl/blogs/check-url-slug-exists

# Check url slug

GET 

## https://services.leadconnectorhq.com/blogs/posts/url-slug-exists

The "Check url slug" API allows check the blog slug validation which is needed before publishing any blog post. Please use blogs/check-slug.readonly. you can find the POST ID from the post edit url.

### Requirements

#### Scope(s)

`blogs/check-slug.readonly`

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

**urlSlug** stringrequired

**locationId** stringrequired

Example: ve9EPM428h8vShlRW1KT

**postId** string

Example: 66f429b8afdce84227a4610d

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

**exists** booleanrequired

Indicates whether the url slug exists or not

```
{  "exists": true}
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

**name:** [Authorization](/docs/ghl/blogs/blogs-api#authentication)**type:** http**scopes:** `blogs/check-slug.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/blogs/posts/url-slug-exists' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

urlSlug — queryrequired

locationId — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

postId — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
