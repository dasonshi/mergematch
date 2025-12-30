# https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-account

# Get Accounts

GET 

## https://services.leadconnectorhq.com/social-media-posting/:locationId/accounts

Get list of accounts and groups

### Requirements

#### Scope(s)

`socialplanner/account.readonly`

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

**locationId** stringrequired

Location Id

Example: ve9EPM428h8vShlRW1KT

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

**success** booleanrequired

Success or Failure

Example:`true`

**statusCode** numberrequired

Status Code

Example:`200`

**message** stringrequired

Message

Example:`Fetched Accounts`

**results** object

Requested Results

**accounts** object\[\]

*   Array \[
    

**id** string

Example:`aF3KhyL8JIuBwzK3m7Ly_Lx1EI6YIgQYMQi0ytFXv_12554616564525983496`

**oauthId** string

Example:`aF3KhyL8JIuBwzK3m7Ly`

**profileId** string

Example:`aF3KhyL8JIuBwzK3m7Ly`

**name** string

Example:`Sample Account`

**platform** string

platform must be one of the following values: google, facebook, instagram, linkedin, twitter, tiktok

Example:`google`

**type** string

Example:`location`

**expire** string

Example:`2024-03-11T19:29:59.785Z`

**isExpired** boolean

Example:`false`

**meta** object

Example:`{"hasGoogleUpdated":true,"canDelete":true}`

*   \]
    

**groups** object\[\]

*   Array \[
    

**id** stringrequired

Group Id

Example:`6284c43d519161e96cc09c13`

**name** stringrequired

name of group

Example:`Primary`

**accountIds** string\[\]required

Example:`["6494063f4260855c1c5776b5_mhoUgTPkz19vjF5Qu7Av_2774080328752823730"]`

*   \]
    

```
{  "success": true,  "statusCode": 200,  "message": "Fetched Accounts",  "results": {    "accounts": [      {        "id": "aF3KhyL8JIuBwzK3m7Ly_Lx1EI6YIgQYMQi0ytFXv_12554616564525983496",        "oauthId": "aF3KhyL8JIuBwzK3m7Ly",        "profileId": "aF3KhyL8JIuBwzK3m7Ly",        "name": "Sample Account",        "platform": "google",        "type": "location",        "expire": "2024-03-11T19:29:59.785Z",        "isExpired": false,        "meta": {          "hasGoogleUpdated": true,          "canDelete": true        }      }    ],    "groups": [      {        "id": "6284c43d519161e96cc09c13",        "name": "Primary",        "accountIds": [          "6494063f4260855c1c5776b5_mhoUgTPkz19vjF5Qu7Av_2774080328752823730"        ]      }    ]  }}
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

**name:** [Authorization](/docs/ghl/social-planner/social-media-posting-api#authentication)**type:** http**scopes:** `socialplanner/account.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/social-media-posting/:locationId/accounts' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — pathrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
