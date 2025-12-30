# https://marketplace.gohighlevel.com/docs/ghl/contacts/create-task

# Create Task

POST 

## https://services.leadconnectorhq.com/contacts/:contactId/tasks

Create Task

### Requirements

#### Scope(s)

`contacts.write`

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

**contactId** stringrequired

Contact Id

Example: sx6wyHhbFdRXh302LLNR

*   application/json

### Body**required**

**title** stringrequired

Example:`First Task`

**body** string

Example:`loram ipsum`

**dueDate** stringrequired

Example:`2020-10-25T11:00:00Z`

**completed** booleanrequired

Example:`true`

**assignedTo** string

Example:`hxHGVRb1YJUscrCB8eXK`

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

**task** object

**id** string

Example:`lJpzYrWdpkC2hX6t2yue`

**title** string

Example:`test`

**body** string

Example:`testing`

**assignedTo** string

Example:`tesTUcmRxWrjqzJS8EjkxNKting`

**dueDate** string

Example:`2021-07-08T02:30:00.000Z`

**completed** boolean

Example:`true`

**contactId** string

Example:`lJpzYrWdpkC2hX6t2yue`

```
{  "task": {    "id": "lJpzYrWdpkC2hX6t2yue",    "title": "test",    "body": "testing",    "assignedTo": "tesTUcmRxWrjqzJS8EjkxNKting",    "dueDate": "2021-07-08T02:30:00.000Z",    "completed": true,    "contactId": "lJpzYrWdpkC2hX6t2yue"  }}
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

**name:** [Authorization](/docs/ghl/contacts/contacts-api#authentication)**type:** http**scopes:** `contacts.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/contacts/:contactId/tasks' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "title": "First Task",  "body": "loram ipsum",  "dueDate": "2020-10-25T11:00:00Z",  "completed": true,  "assignedTo": "hxHGVRb1YJUscrCB8eXK"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

contactId — pathrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "title": "First Task",  "body": "loram ipsum",  "dueDate": "2020-10-25T11:00:00Z",  "completed": true,  "assignedTo": "hxHGVRb1YJUscrCB8eXK"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
