# https://marketplace.gohighlevel.com/docs/ghl/conversations/get-conversation

# Get Conversation

GET 

## https://services.leadconnectorhq.com/conversations/:conversationId

Get the conversation details based on the conversation ID

### Requirements

#### Scope(s)

`conversations.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-04-15`\]

API Version

### Path Parameters

**conversationId** stringrequired

Conversation ID as string

Example: tDtDnQdgm2LXpyiqYvZ6

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**contactId** stringrequired

Unique identifier of the contact associated with this conversation

Example:`ve9EPM428kjkvShlRW1KT`

**locationId** stringrequired

Unique identifier of the business location where this conversation takes place

Example:`ve9EPM428kjkvShlRW1KT`

**deleted** booleanrequired

Flag indicating if this conversation has been moved to trash/deleted

Example:`false`

**inbox** booleanrequired

Flag indicating if this conversation is currently in the main inbox view

Example:`true`

**type** numberrequired

Communication channel type for this conversation: 1 (Phone), 2 (Email), 3 (Facebook Messenger), 4 (Review), 5 (Group SMS), 6 (Internal Chat - coming soon)

**unreadCount** numberrequired

Number of messages in this conversation that have not been read by the user

Example:`1`

**assignedTo** string

Unique identifier of the team member currently responsible for handling this conversation

Example:`ve9EPM428kjkvShlRW1KT`

**id** stringrequired

Unique identifier for this specific conversation thread

Example:`ve9EPM428kjkvShlRW1KT`

**starred** boolean

Flag indicating if this conversation has been marked as important/starred by the user

Example:`true`

```
{  "contactId": "ve9EPM428kjkvShlRW1KT",  "locationId": "ve9EPM428kjkvShlRW1KT",  "deleted": false,  "inbox": true,  "type": 0,  "unreadCount": 1,  "assignedTo": "ve9EPM428kjkvShlRW1KT",  "id": "ve9EPM428kjkvShlRW1KT",  "starred": true}
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

**name:** [Authorization](/docs/ghl/conversations/conversations-api#authentication)**type:** http**scopes:** `conversations.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/conversations/:conversationId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

conversationId — pathrequired

Version — headerrequired

\---2021-04-15

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
