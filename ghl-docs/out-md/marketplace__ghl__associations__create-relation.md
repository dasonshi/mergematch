# https://marketplace.gohighlevel.com/docs/ghl/associations/create-relation

# Create Relation for you associated entities.

POST 

## https://services.leadconnectorhq.com/associations/relations

Create Relation.Documentation Link - [https://doc.clickup.com/8631005/d/h/87cpx-293776/cd0f4122abc04d3](https://doc.clickup.com/8631005/d/h/87cpx-293776/cd0f4122abc04d3)

### Requirements

#### Scope(s)

`associations/relation.write`

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

Your Sub Account's ID

Example:`clF1LD04GTUKN3b3XuOj`

**associationId** stringrequired

Association's Id

Example:`ve9EPM428h8vShlRW1KT`

**firstRecordId** stringrequired

First Record's Id. For instance, if you have an association between a contact and a custom object, and you specify the contact as the first object while creating the association, then your firstRecordId would be the contactId

Example:`ve9EPM428h8vShlRW1KT`

**secondRecordId** stringrequired

Second Record's Id.For instance, if you have an association between a contact and a custom object, and you specify the custom object as the second entity while creating the association, then your secondRecordId would be the customObject record Id

Example:`ve9EPM428h8vShlRW1KT`

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

**locationId** stringrequired

Example:`string`

**id** stringrequired

Example:`ve9EPM428h8vShlRW1KT`

**key** stringrequired

First Objects Association Label (custom\_objects.children)

Example:`student`

**firstObjectLabel** objectrequired

First Objects Association Label (custom\_objects.children)

Example:`student`

**firstObjectKey** objectrequired

First Objects Key

Example:`custom_objects.children`

**secondObjectLabel** objectrequired

Second Object Association Label (contact)

Example:`Teacher`

**secondObjectKey** objectrequired

Second Objects Key

Example:`contact`

**associationType** objectrequired

Association Type can be USER\_DEFINED or SYSTEM\_DEFINED

Example:`USER_DEFINED`

```
{  "locationId": "string",  "id": "ve9EPM428h8vShlRW1KT",  "key": "student",  "firstObjectLabel": "student",  "firstObjectKey": "custom_objects.children",  "secondObjectLabel": "Teacher",  "secondObjectKey": "contact",  "associationType": "USER_DEFINED"}
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

**name:** [Authorization](/docs/ghl/associations/associations-api#authentication)**type:** http**scopes:** `associations/relation.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/associations/relations' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationId": "clF1LD04GTUKN3b3XuOj",  "associationId": "ve9EPM428h8vShlRW1KT",  "firstRecordId": "ve9EPM428h8vShlRW1KT",  "secondRecordId": "ve9EPM428h8vShlRW1KT"}'
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
  "locationId": "clF1LD04GTUKN3b3XuOj",  "associationId": "ve9EPM428h8vShlRW1KT",  "firstRecordId": "ve9EPM428h8vShlRW1KT",  "secondRecordId": "ve9EPM428h8vShlRW1KT"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
