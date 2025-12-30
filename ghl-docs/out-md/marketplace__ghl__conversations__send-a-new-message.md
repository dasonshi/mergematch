# https://marketplace.gohighlevel.com/docs/ghl/conversations/send-a-new-message

# Send a new message

POST 

## https://services.leadconnectorhq.com/conversations/messages

Post the necessary fields for the API to send a new message.

### Requirements

#### Scope(s)

`conversations/message.write`

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

**type** stringrequired

Type of message being sent

**Possible values:** \[`SMS`, `Email`, `WhatsApp`, `IG`, `FB`, `Custom`, `Live_Chat`\]

Example:`Email`

**contactId** stringrequired

ID of the contact receiving the message

Example:`abc123def456`

**appointmentId** string

ID of the associated appointment

Example:`appt123`

**attachments** string\[\]

Array of attachment URLs

Example:`["https://storage.com/file1.pdf","https://storage.com/file2.jpg"]`

**emailFrom** string

Email address to send from

Example:`sender@company.com`

**emailCc** string\[\]

Array of CC email addresses

Example:`["cc1@company.com","cc2@company.com"]`

**emailBcc** string\[\]

Array of BCC email addresses

Example:`["bcc1@company.com","bcc2@company.com"]`

**html** string

HTML content of the message

Example:`<p>Hello World</p>`

**message** string

Text content of the message

Example:`Hello, how can I help you today?`

**subject** string

Subject line for email messages

Example:`Important Update`

**replyMessageId** string

ID of message being replied to

Example:`msg123`

**templateId** string

ID of message template

Example:`template123`

**threadId** string

ID of message thread. For email messages, this is the message ID that contains multiple email messages in the thread

Example:`thread123`

**scheduledTimestamp** number

UTC Timestamp (in seconds) at which the message should be scheduled

Example:`1669287863`

**conversationProviderId** string

ID of conversation provider

Example:`provider123`

**emailTo** string

Email address to send to, if different from contact's primary email. This should be a valid email address associated with the contact.

Example:`recipient@company.com`

**emailReplyMode** string

Mode for email replies

**Possible values:** \[`reply`, `reply_all`\]

Example:`reply_all`

**fromNumber** string

Phone number used as the sender number for outbound messages

Example:`+1499499299`

**toNumber** string

Recipient phone number for outbound messages

Example:`+1439499299`

**status** stringrequired

Message status

**Possible values:** \[`delivered`, `failed`, `pending`, `read`\]

Example:`delivered`

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Created the message

*   application/json

*   Schema
*   Example (auto)

**Schema**

**conversationId** stringrequired

Conversation ID.

Example:`ABC12h2F6uBrIkfXYazb`

**emailMessageId** string

This contains the email message id (only for Email type). Use this ID to send inbound replies to GHL to create a threaded email.

Example:`rnGyqh2F6uBrIkfhFo9A`

**messageId** stringrequired

This is the main Message ID

Example:`t22c6DQcTDf3MjRhwf77`

**messageIds** string\[\]

When sending via the GMB channel, we will be returning list of `messageIds` instead of single `messageId`.

**msg** string

Additional response message when sending a workflow message

Example:`Message queued successfully.`

```
{  "conversationId": "ABC12h2F6uBrIkfXYazb",  "emailMessageId": "rnGyqh2F6uBrIkfhFo9A",  "messageId": "t22c6DQcTDf3MjRhwf77",  "messageIds": [    "string"  ],  "msg": "Message queued successfully."}
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

**name:** [Authorization](/docs/ghl/conversations/conversations-api#authentication)**type:** http**scopes:** `conversations/message.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/conversations/messages' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "type": "Email",  "contactId": "abc123def456",  "appointmentId": "appt123",  "attachments": [    "https://storage.com/file1.pdf",    "https://storage.com/file2.jpg"  ],  "emailFrom": "sender@company.com",  "emailCc": [    "cc1@company.com",    "cc2@company.com"  ],  "emailBcc": [    "bcc1@company.com",    "bcc2@company.com"  ],  "html": "<p>Hello World</p>",  "message": "Hello, how can I help you today?",  "subject": "Important Update",  "replyMessageId": "msg123",  "templateId": "template123",  "threadId": "thread123",  "scheduledTimestamp": 1669287863,  "conversationProviderId": "provider123",  "emailTo": "recipient@company.com",  "emailReplyMode": "reply_all",  "fromNumber": "+1499499299",  "toNumber": "+1439499299",  "status": "delivered"}'
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
  "type": "Email",  "contactId": "abc123def456",  "appointmentId": "appt123",  "attachments": \[    "https://storage.com/file1.pdf",    "https://storage.com/file2.jpg"  \],  "emailFrom": "sender@company.com",  "emailCc": \[    "cc1@company.com",    "cc2@company.com"  \],  "emailBcc": \[    "bcc1@company.com",    "bcc2@company.com"  \],  "html": "<p>Hello World</p>",  "message": "Hello, how can I help you today?",  "subject": "Important Update",  "replyMessageId": "msg123",  "templateId": "template123",  "threadId": "thread123",  "scheduledTimestamp": 1669287863,  "conversationProviderId": "provider123",  "emailTo": "recipient@company.com",  "emailReplyMode": "reply\_all",  "fromNumber": "+1499499299",  "toNumber": "+1439499299",  "status": "delivered"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
