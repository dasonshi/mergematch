# https://marketplace.gohighlevel.com/docs/ghl/social-planner/attach-facebook-page-group

# Attach facebook pages

POST 

## https://services.leadconnectorhq.com/social-media-posting/oauth/:locationId/facebook/accounts/:accountId

Attach facebook pages

### Requirements

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

Account Location Id

Example: w37swmmLbA02zgqKPpxITe2

**accountId** stringrequired

Account Id

Example: w37swmmLbA02zgqKPpxITe

*   application/json

### Body**required**

**type** object

Example:`page`

**originId** string

Example:`244405****11687`

**name** string

Example:`JOHN_DEO`

**avatar** string

Example:`https://storage.googleapis.com/2ad21ebc23/test`

**companyId** string

Company ID

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

Example:`Added Facebook Account`

**results** object

Requested Results

**\_id** string

Example:`65f2d989a4f2f1e5322c3856`

**oAuthId** string

Example:`u37swmmLbA02zgqKPpxITe2`

**oldId** string

Example:`u37swmmLbA02zgqKPpxITe2`

**locationId** string

Example:`u37swmmLbA02zgqKPpxITe2`

**originId** string

Example:`u37swmmLbA02zgqKPpxITe2`

**platform** object

Example:`facebook`

**type** object

type value must be page

Example:`page`

**name** string

Example:`Account Name`

**avatar** string

Example:`u37swmmLbA02zgqKPpxITe2`

**meta** object

Example:`{"pageId":"u37swmmLbA02zgqKPpxITe2","page":{"id":"u37swmmLbA02zgqKPpxITe2","name":"Account Name","avatar":"u37swmmLbA02zgqKPpxITe2"},"storeCode":"122","isVerified":"true","verified":true,"protected":true,"locationId":"u37swmmLbA02zgqKPpxITe2","accountId":"u37swmmLbA02zgqKPpxITe2","openId":"u37swmmLbA02zgqKPpxITe2","urn":"u37swmmLbA02zgqKPpxITe2","username":"testUser","storefrontAddress":{"regionCode":"30021","languageCode":"E001","postalCode":"1221","administrativeArea":"Down Town","locality":"Louis Street","addressLines":["207","county"]}}`

**active** boolean

Example:`true`

**deleted** boolean

Example:`true`

**createdAt** date-time

created date

Example:`2024-03-14T11:03:37.015Z`

**updatedAt** date-time

updated date

Example:`2024-03-14T11:03:37.015Z`

```
{  "success": true,  "statusCode": 201,  "message": "Added Facebook Account",  "results": {    "_id": "65f2d989a4f2f1e5322c3856",    "oAuthId": "u37swmmLbA02zgqKPpxITe2",    "oldId": "u37swmmLbA02zgqKPpxITe2",    "locationId": "u37swmmLbA02zgqKPpxITe2",    "originId": "u37swmmLbA02zgqKPpxITe2",    "platform": "facebook",    "type": "page",    "name": "Account Name",    "avatar": "u37swmmLbA02zgqKPpxITe2",    "meta": {      "pageId": "u37swmmLbA02zgqKPpxITe2",      "page": {        "id": "u37swmmLbA02zgqKPpxITe2",        "name": "Account Name",        "avatar": "u37swmmLbA02zgqKPpxITe2"      },      "storeCode": "122",      "isVerified": "true",      "verified": true,      "protected": true,      "locationId": "u37swmmLbA02zgqKPpxITe2",      "accountId": "u37swmmLbA02zgqKPpxITe2",      "openId": "u37swmmLbA02zgqKPpxITe2",      "urn": "u37swmmLbA02zgqKPpxITe2",      "username": "testUser",      "storefrontAddress": {        "regionCode": "30021",        "languageCode": "E001",        "postalCode": "1221",        "administrativeArea": "Down Town",        "locality": "Louis Street",        "addressLines": [          "207",          "county"        ]      }    },    "active": true,    "deleted": true,    "createdAt": "2024-03-14T11:03:37.015Z",    "updatedAt": "2024-03-14T11:03:37.015Z"  }}
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

**name:** [Authorization](/docs/ghl/social-planner/social-media-posting-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/social-media-posting/oauth/:locationId/facebook/accounts/:accountId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "type": "page",  "originId": "244405****11687",  "name": "JOHN_DEO",  "avatar": "https://storage.googleapis.com/2ad21ebc23/test",  "companyId": "sdfdsfdsfEWEsdfsdsW32dd"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — pathrequired

accountId — pathrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "type": "page",  "originId": "244405\*\*\*\*11687",  "name": "JOHN\_DEO",  "avatar": "https://storage.googleapis.com/2ad21ebc23/test",  "companyId": "sdfdsfdsfEWEsdfsdsW32dd"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
