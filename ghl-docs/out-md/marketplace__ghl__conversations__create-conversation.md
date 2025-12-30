# https://marketplace.gohighlevel.com/docs/ghl/conversations/create-conversation

# Create Conversation

POST 

## https://services.leadconnectorhq.com/conversations/

Creates a new conversation with the data provided

### Requirements

#### Scope(s)

`conversations.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-04-15`\]

API Version

*   application/json

### Body**required**

**locationId** stringrequired

Location ID as string

Example:`tDtDnQdgm2LXpyiqYvZ6`

**contactId** stringrequired

Contact ID as string

Example:`tDtDnQdgm2LXpyiqYvZ6`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**success** booleanrequired

Indicates whether the API request was successful.

Example:`true`

**conversation** object

Conversation data of the provided conversation ID.

**id** stringrequired

Unique identifier for the conversation

Example:`tDtDnQdgm2LXpyiqYvZ6`

**dateUpdated** stringrequired

Date when the conversation was last updated

Example:`2023-10-01T12:00:00Z`

**dateAdded** stringrequired

Date when the conversation was created

Example:`2023-10-01T12:00:00Z`

**deleted** booleanrequired

Flag indicating if this conversation has been deleted

Example:`false`

**contactId** stringrequired

Unique identifier of the contact associated with this conversation

Example:`ve9EPM428kjkvShlRW1KT`

**locationId** stringrequired

Unique identifier of the business location where this conversation takes place

Example:`ve9EPM428kjkvShlRW1KT`

**lastMessageDate** stringrequired

Date of the last message in the conversation

Example:`2023-10-01T12:00:00Z`

**assignedTo** string

Unique identifier of the team member assigned to this conversation

Example:`ve9EPM428kjkvShlRW1KT`

```
{  "success": true,  "conversation": {    "id": "tDtDnQdgm2LXpyiqYvZ6",    "dateUpdated": "2023-10-01T12:00:00Z",    "dateAdded": "2023-10-01T12:00:00Z",    "deleted": false,    "contactId": "ve9EPM428kjkvShlRW1KT",    "locationId": "ve9EPM428kjkvShlRW1KT",    "lastMessageDate": "2023-10-01T12:00:00Z",    "assignedTo": "ve9EPM428kjkvShlRW1KT"  }}
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

**name:** [Authorization](/docs/ghl/conversations/conversations-api#authentication)**type:** http**scopes:** `conversations.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/conversations/' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationId": "tDtDnQdgm2LXpyiqYvZ6",  "contactId": "tDtDnQdgm2LXpyiqYvZ6"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

Version — headerrequired

\---2021-04-15

Body required

{
  "locationId": "tDtDnQdgm2LXpyiqYvZ6",  "contactId": "tDtDnQdgm2LXpyiqYvZ6"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
