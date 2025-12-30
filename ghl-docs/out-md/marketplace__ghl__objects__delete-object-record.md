# https://marketplace.gohighlevel.com/docs/ghl/objects/delete-object-record

# Delete Record

DELETE 

## https://services.leadconnectorhq.com/objects/:schemaKey/records/:id

Delete Record By Id . Supported Objects are business and custom objects.

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

**schemaKey** stringrequired

The key of the Custom Object / Standard Object Schema. For custom objects, the key must include the “custom\_objects.” prefix, while standard objects use their respective object keys. This information is available on the Custom Objects Details page under Settings.

Example: custom\_objects.pet or business.email (for company's email)

**id** stringrequired

id of the record to be updated. Available on the Record details page under the 3 dots or in the url

Example: 632c34b4c9b7da3358ac9891

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**id** string

id of the deleted object

Example:`661c06b4ffde146bdb469442`

**success** boolean

boolean that defines if the operation was a success or not

Example:`true`

```
{  "id": "661c06b4ffde146bdb469442",  "success": true}
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

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/objects/custom-objects-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X DELETE 'https://services.leadconnectorhq.com/objects/:schemaKey/records/:id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

schemaKey — pathrequired

id — pathrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
