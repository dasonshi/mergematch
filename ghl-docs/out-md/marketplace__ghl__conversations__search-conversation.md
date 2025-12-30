# https://marketplace.gohighlevel.com/docs/ghl/conversations/search-conversation

# Search Conversations

GET 

## https://services.leadconnectorhq.com/conversations/search

Returns a list of all conversations matching the search criteria along with the sort and filter options selected.

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

### Query Parameters

**locationId** stringrequired

Location Id

Example: ABCHkzuJQ8ZMd4Te84GK

**contactId** string

Contact Id

Example: 9VEmS0si86GW6gXWU89b

**assignedTo** string

User IDs that conversations are assigned to. Multiple IDs can be provided as comma-separated values. Use "unassigned" to fetch conversations not assigned to any user.

Example: ABCHkzuJQ8ZMd4Te84GK,fGiae4CHkzoskh8thsik

**followers** string

User IDs of followers to filter conversations by. Multiple IDs can be provided as comma-separated values.

Example: ABCHkzuJQ8ZMd4Te84GK,fGiae4CHkzoskh8thsik

**mentions** string

User Id of the mention. Multiple values are comma separated.

Example: ABCHkzuJQ8ZMd4Te84GK,fGiae4CHkzoskh8thsik

**query** string

Search paramater as a string

Example: Search string

**sort** string

**Possible values:** \[`asc`, `desc`\]

Sort paramater - asc or desc

Example: asc

**startAfterDate** any

Search to begin after the specified date - should contain the sort value of the last document

Example: 1600854

**id** string

Id of the conversation

Example: ABCHkzuJQ8ZMd4Te84GK

**limit** number

Limit of conversations - Default is 20

Example: 20

**lastMessageType** string

**Possible values:** \[`TYPE_CALL`, `TYPE_SMS`, `TYPE_EMAIL`, `TYPE_SMS_REVIEW_REQUEST`, `TYPE_WEBCHAT`, `TYPE_SMS_NO_SHOW_REQUEST`, `TYPE_CAMPAIGN_SMS`, `TYPE_CAMPAIGN_CALL`, `TYPE_CAMPAIGN_EMAIL`, `TYPE_CAMPAIGN_VOICEMAIL`, `TYPE_FACEBOOK`, `TYPE_CAMPAIGN_FACEBOOK`, `TYPE_CAMPAIGN_MANUAL_CALL`, `TYPE_CAMPAIGN_MANUAL_SMS`, `TYPE_GMB`, `TYPE_CAMPAIGN_GMB`, `TYPE_REVIEW`, `TYPE_INSTAGRAM`, `TYPE_WHATSAPP`, `TYPE_CUSTOM_SMS`, `TYPE_CUSTOM_EMAIL`, `TYPE_CUSTOM_PROVIDER_SMS`, `TYPE_CUSTOM_PROVIDER_EMAIL`, `TYPE_IVR_CALL`, `TYPE_ACTIVITY_CONTACT`, `TYPE_ACTIVITY_INVOICE`, `TYPE_ACTIVITY_PAYMENT`, `TYPE_ACTIVITY_OPPORTUNITY`, `TYPE_LIVE_CHAT`, `TYPE_LIVE_CHAT_INFO_MESSAGE`, `TYPE_ACTIVITY_APPOINTMENT`, `TYPE_FACEBOOK_COMMENT`, `TYPE_INSTAGRAM_COMMENT`, `TYPE_CUSTOM_CALL`, `TYPE_INTERNAL_COMMENT`, `TYPE_ACTIVITY_EMPLOYEE_ACTION_LOG`\]

Type of the last message in the conversation as a string

Example: TYPE\_SMS

**lastMessageAction** string

**Possible values:** \[`automated`, `manual`\]

Action of the last outbound message in the conversation as string.

Example: manual

**lastMessageDirection** string

**Possible values:** \[`inbound`, `outbound`\]

Direction of the last message in the conversation as string.

Example: inbound

**status** string

**Possible values:** \[`all`, `read`, `unread`, `starred`, `recents`\]

The status of the conversation to be filtered - all, read, unread, starred

Example: all

**sortBy** string

**Possible values:** \[`last_manual_message_date`, `last_message_date`, `score_profile`\]

The sorting of the conversation to be filtered as - manual messages or all messages

Example: last\_message\_date

**sortScoreProfile** string

Id of score profile on which sortBy.ScoreProfile should sort on

Example: ABCHkzuJQ8ZMd4Te84GK

**scoreProfile** string

Id of score profile on which conversations should get filtered out, works with scoreProfileMin & scoreProfileMax

Example: ABCHkzuJQ8ZMd4Te84GK

**scoreProfileMin** number

Minimum value for score

Example: ABCHkzuJQ8ZMd4Te84GK

**scoreProfileMax** number

Maximum value for score

Example: ABCHkzuJQ8ZMd4Te84GK

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successfully fetched the conversations

*   application/json

*   Schema
*   Example (auto)

**Schema**

**conversations** object\[\]required

The list of all conversations found for the given query

*   Array \[
    

**id** stringrequired

Conversation Id

Example:`ABCHkzuJQ8ZMd4Te84GK`

**contactId** stringrequired

Contact Id

Example:`ABCHkzuJQ8ZMd4Te84GK`

**locationId** stringrequired

Location Id

Example:`ABCHkzuJQ8ZMd4Te84GK`

**lastMessageBody** stringrequired

Content of the most recent message in the conversation

Example:`This is a sample message body`

**lastMessageType** stringrequired

Channel/type of the most recent message (SMS, Email, Call, etc)

**Possible values:** \[`TYPE_CALL`, `TYPE_SMS`, `TYPE_EMAIL`, `TYPE_SMS_REVIEW_REQUEST`, `TYPE_WEBCHAT`, `TYPE_SMS_NO_SHOW_REQUEST`, `TYPE_CAMPAIGN_SMS`, `TYPE_CAMPAIGN_CALL`, `TYPE_CAMPAIGN_EMAIL`, `TYPE_CAMPAIGN_VOICEMAIL`, `TYPE_FACEBOOK`, `TYPE_CAMPAIGN_FACEBOOK`, `TYPE_CAMPAIGN_MANUAL_CALL`, `TYPE_CAMPAIGN_MANUAL_SMS`, `TYPE_GMB`, `TYPE_CAMPAIGN_GMB`, `TYPE_REVIEW`, `TYPE_INSTAGRAM`, `TYPE_WHATSAPP`, `TYPE_CUSTOM_SMS`, `TYPE_CUSTOM_EMAIL`, `TYPE_CUSTOM_PROVIDER_SMS`, `TYPE_CUSTOM_PROVIDER_EMAIL`, `TYPE_IVR_CALL`, `TYPE_ACTIVITY_CONTACT`, `TYPE_ACTIVITY_INVOICE`, `TYPE_ACTIVITY_PAYMENT`, `TYPE_ACTIVITY_OPPORTUNITY`, `TYPE_LIVE_CHAT`, `TYPE_LIVE_CHAT_INFO_MESSAGE`, `TYPE_ACTIVITY_APPOINTMENT`, `TYPE_FACEBOOK_COMMENT`, `TYPE_INSTAGRAM_COMMENT`, `TYPE_CUSTOM_CALL`, `TYPE_INTERNAL_COMMENT`, `TYPE_ACTIVITY_EMPLOYEE_ACTION_LOG`\]

Example:`TYPE_SMS`

**type** stringrequired

Primary channel/type of the conversation (Phone, Email, etc)

**Possible values:** \[`TYPE_PHONE`, `TYPE_EMAIL`, `TYPE_FB_MESSENGER`, `TYPE_REVIEW`, `TYPE_GROUP_SMS`\]

Example:`TYPE_PHONE`

**unreadCount** numberrequired

Number of unread messages in this conversation

Example:`1`

**fullName** stringrequired

Complete name of the contact (first and last name)

Example:`John Doe`

**contactName** stringrequired

Alternative display name for the contact - used when full name is not available

Example:`John Doe Company`

**email** stringrequired

Primary email address of the contact

Example:`johndoe@mailingdomain.com`

**phone** stringrequired

Primary phone number of the contact

Example:`+15550001234`

*   \]
    

**total** numberrequired

Total Number of results found for the given query

Example:`100`

```
{  "conversations": [    {      "id": "ABCHkzuJQ8ZMd4Te84GK",      "contactId": "ABCHkzuJQ8ZMd4Te84GK",      "locationId": "ABCHkzuJQ8ZMd4Te84GK",      "lastMessageBody": "This is a sample message body",      "lastMessageType": "TYPE_SMS",      "type": "TYPE_PHONE",      "unreadCount": 1,      "fullName": "John Doe",      "contactName": "John Doe Company",      "email": "johndoe@mailingdomain.com",      "phone": "+15550001234"    }  ],  "total": 100}
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
curl -L 'https://services.leadconnectorhq.com/conversations/search' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — queryrequired

Version — headerrequired

\---2021-04-15

Show optional parameters

contactId — query

assignedTo — query

followers — query

mentions — query

query — query

sort — query

\---ascdesc

startAfterDate — query

id — query

limit — query

lastMessageType — query

\---TYPE\_CALLTYPE\_SMSTYPE\_EMAILTYPE\_SMS\_REVIEW\_REQUESTTYPE\_WEBCHATTYPE\_SMS\_NO\_SHOW\_REQUESTTYPE\_CAMPAIGN\_SMSTYPE\_CAMPAIGN\_CALLTYPE\_CAMPAIGN\_EMAILTYPE\_CAMPAIGN\_VOICEMAILTYPE\_FACEBOOKTYPE\_CAMPAIGN\_FACEBOOKTYPE\_CAMPAIGN\_MANUAL\_CALLTYPE\_CAMPAIGN\_MANUAL\_SMSTYPE\_GMBTYPE\_CAMPAIGN\_GMBTYPE\_REVIEWTYPE\_INSTAGRAMTYPE\_WHATSAPPTYPE\_CUSTOM\_SMSTYPE\_CUSTOM\_EMAILTYPE\_CUSTOM\_PROVIDER\_SMSTYPE\_CUSTOM\_PROVIDER\_EMAILTYPE\_IVR\_CALLTYPE\_ACTIVITY\_CONTACTTYPE\_ACTIVITY\_INVOICETYPE\_ACTIVITY\_PAYMENTTYPE\_ACTIVITY\_OPPORTUNITYTYPE\_LIVE\_CHATTYPE\_LIVE\_CHAT\_INFO\_MESSAGETYPE\_ACTIVITY\_APPOINTMENTTYPE\_FACEBOOK\_COMMENTTYPE\_INSTAGRAM\_COMMENTTYPE\_CUSTOM\_CALLTYPE\_INTERNAL\_COMMENTTYPE\_ACTIVITY\_EMPLOYEE\_ACTION\_LOG

lastMessageAction — query

\---automatedmanual

lastMessageDirection — query

\---inboundoutbound

status — query

\---allreadunreadstarredrecents

sortBy — query

\---last\_manual\_message\_datelast\_message\_datescore\_profile

sortScoreProfile — query

scoreProfile — query

scoreProfileMin — query

scoreProfileMax — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
