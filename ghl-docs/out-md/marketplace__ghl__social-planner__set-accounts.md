# https://marketplace.gohighlevel.com/docs/ghl/social-planner/set-accounts

# Set Accounts

POST 

## https://services.leadconnectorhq.com/social-media-posting/:locationId/set-accounts

Set Accounts

### Requirements

#### Scope(s)

`socialplanner/csv.write`

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

*   application/json

### Body**required**

**accountIds** string\[\]required

Account Ids

Example:`["aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"]`

**filePath** stringrequired

File path

Example:`o6241QsiRwUIJHyjuhos/social-planner-import/a6d04a26-0401-4e52-8f48-dbb274050fab.csv`

**rowsCount** numberrequired

Entires Count. rowcCount must be between 1 and number of posts in CSV

Example:`1`

**fileName** stringrequired

Name of file

Example:`test.csv`

**approver** string

Example:`o6241QsiRwUIJHyjuhos`

**userId** string

User ID

Example:`sdfdsfdsfEWEsdfsdsW32dd`

## Responses[​](#responses "Direct link to Responses")

*   201
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

Example:`201`

**message** stringrequired

Message

Example:`Accounts Set Successfully`

```
{  "success": true,  "statusCode": 201,  "message": "Accounts Set Successfully"}
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

**name:** [Authorization](/docs/ghl/social-planner/social-media-posting-api#authentication)**type:** http**scopes:** `socialplanner/csv.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/social-media-posting/:locationId/set-accounts' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "accountIds": [    "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"  ],  "filePath": "o6241QsiRwUIJHyjuhos/social-planner-import/a6d04a26-0401-4e52-8f48-dbb274050fab.csv",  "rowsCount": 1,  "fileName": "test.csv",  "approver": "o6241QsiRwUIJHyjuhos",  "userId": "sdfdsfdsfEWEsdfsdsW32dd"}'
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

Body required

{
  "accountIds": \[    "aF3KhyL8JIuBwzK3m7Ly\_iVrVJ2uoXNF0wzcBzgl5\_12554616564525983496"  \],  "filePath": "o6241QsiRwUIJHyjuhos/social-planner-import/a6d04a26-0401-4e52-8f48-dbb274050fab.csv",  "rowsCount": 1,  "fileName": "test.csv",  "approver": "o6241QsiRwUIJHyjuhos",  "userId": "sdfdsfdsfEWEsdfsdsW32dd"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
