# https://marketplace.gohighlevel.com/docs/ghl/conversations/get-messages

# Get messages by conversation id

GET 

## https://services.leadconnectorhq.com/conversations/:conversationId/messages

Get messages by conversation id.

### Requirements

#### Scope(s)

`conversations/message.readonly`

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

### Query Parameters

**lastMessageId** string

Message ID of the last message in the list as a string

Example: tDtDnQdgm2LXpyiqYvZ6

**limit** number

Number of messages to be fetched from the conversation. Default limit is 20

Example: 20

**type** string

**Possible values:** \[`TYPE_CALL`, `TYPE_SMS`, `TYPE_EMAIL`, `TYPE_FACEBOOK`, `TYPE_GMB`, `TYPE_INSTAGRAM`, `TYPE_WHATSAPP`, `TYPE_ACTIVITY_APPOINTMENT`, `TYPE_ACTIVITY_CONTACT`, `TYPE_ACTIVITY_INVOICE`, `TYPE_ACTIVITY_PAYMENT`, `TYPE_ACTIVITY_OPPORTUNITY`, `TYPE_LIVE_CHAT`, `TYPE_INTERNAL_COMMENTS`, `TYPE_ACTIVITY_EMPLOYEE_ACTION_LOG`\]

Types of message to fetched separated with comma

Example: TYPE\_SMS,TYPE\_CALL

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

List of messages for the conversation id of the given type.

*   application/json

*   Schema
*   Example (auto)

**Schema**

**messages** objectrequired

**lastMessageId** stringrequired

Id of the last message in the messages array

Example:`p1mRSHeLDhAms5q0LMr4`

**nextPage** booleanrequired

Next page value true indicates only 20 message is in the response. Rest of the messages are in the next page. Please use the lastMessageId value in the query to get the next page messages

Example:`true`

**messages** object\[\]required

Array of messages

*   Array \[
    

**id** stringrequired

Example:`ve9EPM428h8vShlRW1KT`

**altId** string

Alternative identifier for the message

Example:`msg_123456789`

**type** numberrequired

Example:`1`

**messageType** stringrequired

Type of the message as a string

**Possible values:** \[`TYPE_CALL`, `TYPE_SMS`, `TYPE_EMAIL`, `TYPE_SMS_REVIEW_REQUEST`, `TYPE_WEBCHAT`, `TYPE_SMS_NO_SHOW_REQUEST`, `TYPE_CAMPAIGN_SMS`, `TYPE_CAMPAIGN_CALL`, `TYPE_CAMPAIGN_EMAIL`, `TYPE_CAMPAIGN_VOICEMAIL`, `TYPE_FACEBOOK`, `TYPE_CAMPAIGN_FACEBOOK`, `TYPE_CAMPAIGN_MANUAL_CALL`, `TYPE_CAMPAIGN_MANUAL_SMS`, `TYPE_GMB`, `TYPE_CAMPAIGN_GMB`, `TYPE_REVIEW`, `TYPE_INSTAGRAM`, `TYPE_WHATSAPP`, `TYPE_CUSTOM_SMS`, `TYPE_CUSTOM_EMAIL`, `TYPE_CUSTOM_PROVIDER_SMS`, `TYPE_CUSTOM_PROVIDER_EMAIL`, `TYPE_IVR_CALL`, `TYPE_ACTIVITY_CONTACT`, `TYPE_ACTIVITY_INVOICE`, `TYPE_ACTIVITY_PAYMENT`, `TYPE_ACTIVITY_OPPORTUNITY`, `TYPE_LIVE_CHAT`, `TYPE_LIVE_CHAT_INFO_MESSAGE`, `TYPE_ACTIVITY_APPOINTMENT`, `TYPE_FACEBOOK_COMMENT`, `TYPE_INSTAGRAM_COMMENT`, `TYPE_CUSTOM_CALL`, `TYPE_INTERNAL_COMMENT`, `TYPE_ACTIVITY_EMPLOYEE_ACTION_LOG`\]

Example:`SMS`

**locationId** stringrequired

Example:`ve9EPM428h8vShlRW1KT`

**contactId** stringrequired

Example:`ve9EPM428h8vShlRW1KT`

**conversationId** stringrequired

Example:`ve9EPM428h8vShlRW1KT`

**dateAdded** stringrequired

Example:`2024-03-27T18:13:49.000Z`

**body** string

Example:`Hi there`

**direction** stringrequired

**Possible values:** \[`inbound`, `outbound`\]

**status** string

**Possible values:** \[`connected`, `delivered`, `failed`, `opened`, `pending`, `read`, `scheduled`, `sent`, `undelivered`, `clicked`, `opt_out`\]

**contentType** stringrequired

Example:`text/plain`

**attachments** string\[\]

An array of attachment URLs. Attachments will be empty for Call and Voicemails, type 1 and 10. Please use get call recording API to fetch call recording and voicemails.

**meta** object

**callDuration** string

Call duration in seconds

Example:`120`

**callStatus** string

Call status - can be pending, completed, answered, busy, no-answer, failed, canceled, or voicemail

**Possible values:** \[`pending`, `completed`, `answered`, `busy`, `no-answer`, `failed`, `canceled`, `voicemail`\]

Example:`completed`

**email** object

meta will contain email, for message type 3 (email). messageIds is list of all email message ids under the message thread

Example:`{"email":{"messageIds":["ve9EPM428kjkvShlRW1KT","ve9EPs1028kjkvShlRW1KT"]}}`

**ig** object

meta will contain ig, for message type 18 (instagram).

Example:`{"ig":{"page_id":"1234567890","page_name":"Instagram Page"}}`

**fb** object

meta will contain fb, for message type 11 (facebook).

Example:`{"fb":{"page_id":"1234567890","page_name":"Facebook Page"}}`

**source** string

Message source

**Possible values:** \[`workflow`, `bulk_actions`, `campaign`, `api`, `app`\]

**userId** string

User Id

Example:`ve9EPM428kjkvShlRW1KT`

**conversationProviderId** string

Conversation Provider Id

Example:`ve9EPM428kjkvShlRW1KT`

**chatWidgetId** string

Chat Widget Id

Example:`67b0cc8cf14b19d85ace7s35`

*   \]
    

```
{  "messages": {    "lastMessageId": "p1mRSHeLDhAms5q0LMr4",    "nextPage": true,    "messages": [      {        "id": "ve9EPM428h8vShlRW1KT",        "altId": "msg_123456789",        "type": 1,        "messageType": "SMS",        "locationId": "ve9EPM428h8vShlRW1KT",        "contactId": "ve9EPM428h8vShlRW1KT",        "conversationId": "ve9EPM428h8vShlRW1KT",        "dateAdded": "2024-03-27T18:13:49.000Z",        "body": "Hi there",        "direction": "inbound",        "status": "connected",        "contentType": "text/plain",        "attachments": [          "string"        ],        "meta": {          "callDuration": 120,          "callStatus": "completed",          "email": {            "email": {              "messageIds": [                "ve9EPM428kjkvShlRW1KT",                "ve9EPs1028kjkvShlRW1KT"              ]            }          },          "ig": {            "ig": {              "page_id": "1234567890",              "page_name": "Instagram Page"            }          },          "fb": {            "fb": {              "page_id": "1234567890",              "page_name": "Facebook Page"            }          }        },        "source": "workflow",        "userId": "ve9EPM428kjkvShlRW1KT",        "conversationProviderId": "ve9EPM428kjkvShlRW1KT",        "chatWidgetId": "67b0cc8cf14b19d85ace7s35"      }    ]  }}
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

**name:** [Authorization](/docs/ghl/conversations/conversations-api#authentication)**type:** http**scopes:** `conversations/message.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/conversations/:conversationId/messages' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

Show optional parameters

lastMessageId — query

limit — query

type — query

\---TYPE\_CALLTYPE\_SMSTYPE\_EMAILTYPE\_FACEBOOKTYPE\_GMBTYPE\_INSTAGRAMTYPE\_WHATSAPPTYPE\_ACTIVITY\_APPOINTMENTTYPE\_ACTIVITY\_CONTACTTYPE\_ACTIVITY\_INVOICETYPE\_ACTIVITY\_PAYMENTTYPE\_ACTIVITY\_OPPORTUNITYTYPE\_LIVE\_CHATTYPE\_INTERNAL\_COMMENTSTYPE\_ACTIVITY\_EMPLOYEE\_ACTION\_LOG

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
