# https://marketplace.gohighlevel.com/docs/ghl/contacts/create-association

# Update Contacts Tags

POST 

## https://services.leadconnectorhq.com/contacts/bulk/tags/update/:type

Allows you to update tags to multiple contacts at once, you can add or remove tags from the contacts

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

**type** stringrequired

**Possible values:** \[`add`, `remove`\]

Tags operation type

Example: add

*   application/json

### Body**required**

**contacts** string\[\]required

list of contact ids to be processed

Example:`["qFSqySFkVvNzOSqgGqFi","abcdef","qFSqySFkVvNzOSqgGqFi","3ualbhnV7j3n3a9r2moD"]`

**tags** string\[\]required

list of tags to be added or removed

Example:`["tag-1","tag-2"]`

**locationId** stringrequired

location id from where the bulk request is executed

Example:`asdrwHvLUxlfw5SqKVCN`

**removeAllTags** boolean

Option to implement remove all tags. if true, all tags will be removed from the contacts. Can only be used with remove type.

Example:`false`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   422

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**succeded** booleanrequired

Indicates if the operation was successful

Example:`true`

**errorCount** numberrequired

Number of errors encountered during the operation

Example:`0`

**responses** string\[\]required

Responses for each contact processed

Example:`[{"contactId":"qFSqySFkVvNzOSqgGqFi","message":"Tags updated","type":"success","oldTags":["tag-1","tag-2"],"tagsAdded":[],"tagsRemoved":[]},{"contactId":"abcdef","message":"contact id is not a valid firebase id","type":"error"},{"contactId":"qFSqySFkVvNzOSqgGqFi","message":"contact is deleted","type":"error"},{"contactId":"3ualbhnV7j3n3a9r2moD","message":"contact does not belong to location","type":"error"}]`

```
{  "succeded": true,  "errorCount": 0,  "responses": [    {      "contactId": "qFSqySFkVvNzOSqgGqFi",      "message": "Tags updated",      "type": "success",      "oldTags": [        "tag-1",        "tag-2"      ],      "tagsAdded": [],      "tagsRemoved": []    },    {      "contactId": "abcdef",      "message": "contact id is not a valid firebase id",      "type": "error"    },    {      "contactId": "qFSqySFkVvNzOSqgGqFi",      "message": "contact is deleted",      "type": "error"    },    {      "contactId": "3ualbhnV7j3n3a9r2moD",      "message": "contact does not belong to location",      "type": "error"    }  ]}
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

**name:** [Authorization](/docs/ghl/contacts/contacts-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/contacts/bulk/tags/update/:type' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "contacts": [    "qFSqySFkVvNzOSqgGqFi",    "abcdef",    "qFSqySFkVvNzOSqgGqFi",    "3ualbhnV7j3n3a9r2moD"  ],  "tags": [    "tag-1",    "tag-2"  ],  "locationId": "asdrwHvLUxlfw5SqKVCN",  "removeAllTags": "false"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

type — pathrequired

\---addremove

Version — headerrequired

\---2021-07-28

Body required

{
  "contacts": \[    "qFSqySFkVvNzOSqgGqFi",    "abcdef",    "qFSqySFkVvNzOSqgGqFi",    "3ualbhnV7j3n3a9r2moD"  \],  "tags": \[    "tag-1",    "tag-2"  \],  "locationId": "asdrwHvLUxlfw5SqKVCN",  "removeAllTags": "false"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
