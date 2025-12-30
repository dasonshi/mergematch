# https://marketplace.gohighlevel.com/docs/ghl/social-planner/start-twitter-oauth

# Starts OAuth For Twitter Account

GET 

## https://services.leadconnectorhq.com/social-media-posting/oauth/twitter/start

deprecated

This endpoint has been deprecated and may be replaced or removed in future versions of the API.

As of December 4, 2024, X (formerly Twitter) is no longer supported. We apologise for any inconvenience.

### Requirements

#### Scope(s)

`socialplanner/oauth.readonly`

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

Location Id

Example: w37swmmLbA02zgqKPpxITe2

**userId** stringrequired

User Id

Example: u37swmmLbA02zgqKPpxITe2

**page** string

Page

Example: integration

**reconnect** string

Reconnect

Example: true

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   422

Successful Response

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

**name:** [Authorization](/docs/ghl/social-planner/social-media-posting-api#authentication)**type:** http**scopes:** `socialplanner/oauth.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/social-media-posting/oauth/twitter/start' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — queryrequired

userId — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

page — query

reconnect — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
