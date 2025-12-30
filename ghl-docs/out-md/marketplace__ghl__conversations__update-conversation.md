# https://marketplace.gohighlevel.com/docs/ghl/conversations/update-conversation

# Update Conversation

PUT 

## https://services.leadconnectorhq.com/conversations/:conversationId

Update the conversation details based on the conversation ID

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

### Path Parameters

**conversationId** stringrequired

Conversation ID as string

Example: tDtDnQdgm2LXpyiqYvZ6

*   application/json

### Body**required**

**locationId** stringrequired

Location ID as string

Example:`tDtDnQdgm2LXpyiqYvZ6`

**unreadCount** number

Count of unread messages in the conversation

Example:`1`

**starred** boolean

Starred status of the conversation.

Example:`true`

**feedback** object

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**success** booleanrequired

Boolean value as the API response.

Example:`true`

**conversation** object

Conversation data of the provided conversation ID.

**id** string

Contact ID as string

Example:`tDtDnQdgm2LXpyiqYvZ6`

**locationId** stringrequired

Location ID as string

Example:`tDtDnQdgm2LXpyiqYvZ6`

**contactId** stringrequired

Contact ID as string

Example:`tDtDnQdgm2LXpyiqYvZ6`

**assignedTo** string

Assigned User ID as string

Example:`tDtDnQdgm2LXpyiqYvZ6`

**userId** string

User ID as string

Example:`tDtDnQdgm2LXpyiqYvZ6`

**lastMessageBody** string

Last message body as string

Example:`Hello, this is the message body`

**lastMessageDate** string

Last message date as UTC

Example:`1628008053263`

**lastMessageType** string

Type of the last message sent/received in the conversation.

**Possible values:** \[`TYPE_CALL`, `TYPE_SMS`, `TYPE_EMAIL`, `TYPE_SMS_REVIEW_REQUEST`, `TYPE_WEBCHAT`, `TYPE_SMS_NO_SHOW_REQUEST`, `TYPE_CAMPAIGN_SMS`, `TYPE_CAMPAIGN_CALL`, `TYPE_CAMPAIGN_EMAIL`, `TYPE_CAMPAIGN_VOICEMAIL`, `TYPE_FACEBOOK`, `TYPE_CAMPAIGN_FACEBOOK`, `TYPE_CAMPAIGN_MANUAL_CALL`, `TYPE_CAMPAIGN_MANUAL_SMS`, `TYPE_GMB`, `TYPE_CAMPAIGN_GMB`, `TYPE_REVIEW`, `TYPE_INSTAGRAM`, `TYPE_WHATSAPP`, `TYPE_CUSTOM_SMS`, `TYPE_CUSTOM_EMAIL`, `TYPE_CUSTOM_PROVIDER_SMS`, `TYPE_CUSTOM_PROVIDER_EMAIL`, `TYPE_IVR_CALL`, `TYPE_ACTIVITY_CONTACT`, `TYPE_ACTIVITY_INVOICE`, `TYPE_ACTIVITY_PAYMENT`, `TYPE_ACTIVITY_OPPORTUNITY`, `TYPE_LIVE_CHAT`, `TYPE_LIVE_CHAT_INFO_MESSAGE`, `TYPE_ACTIVITY_APPOINTMENT`, `TYPE_FACEBOOK_COMMENT`, `TYPE_INSTAGRAM_COMMENT`, `TYPE_CUSTOM_CALL`, `TYPE_INTERNAL_COMMENT`, `TYPE_ACTIVITY_EMPLOYEE_ACTION_LOG`\]

Example:`TYPE_CALL`

**unreadCount** number

Count of unread messages in the conversation

Example:`1`

**inbox** boolean

Inbox status of the conversation.

Example:`true`

**starred** boolean

Starred status of the conversation.

Example:`true`

**deleted** booleanrequired

Deleted status of the conversation.

Example:`false`

```
{  "success": true,  "conversation": {    "id": "tDtDnQdgm2LXpyiqYvZ6",    "locationId": "tDtDnQdgm2LXpyiqYvZ6",    "contactId": "tDtDnQdgm2LXpyiqYvZ6",    "assignedTo": "tDtDnQdgm2LXpyiqYvZ6",    "userId": "tDtDnQdgm2LXpyiqYvZ6",    "lastMessageBody": "Hello, this is the message body",    "lastMessageDate": "1628008053263",    "lastMessageType": "TYPE_CALL",    "unreadCount": 1,    "inbox": true,    "starred": true,    "deleted": false  }}
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
curl -L -X PUT 'https://services.leadconnectorhq.com/conversations/:conversationId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationId": "tDtDnQdgm2LXpyiqYvZ6",  "unreadCount": 1,  "starred": true,  "feedback": {}}'
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

Body required

{
  "locationId": "tDtDnQdgm2LXpyiqYvZ6",  "unreadCount": 1,  "starred": true,  "feedback": {}
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
