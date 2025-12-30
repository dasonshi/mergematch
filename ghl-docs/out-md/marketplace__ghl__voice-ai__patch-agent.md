# https://marketplace.gohighlevel.com/docs/ghl/voice-ai/patch-agent

# Patch Agent

PATCH 

## https://services.leadconnectorhq.com/voice-ai/agents/:agentId

Partially update an existing voice AI agent

### Requirements

#### Scope(s)

`voice-ai-agents.write`

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

**agentId** stringrequired

Unique agent identifier

Example: 507f1f77bcf86cd799439011

### Query Parameters

**locationId** stringrequired

Location ID

Example: LOC123456789ABCDEF

*   application/json

### Body**required**

**agentName** string

Display name for the voice AI agent, between 1-40 characters. Default: "My Agent {random 3 digit number}"

**Possible values:** `non-empty` and `<= 40 characters`

Example:`Customer Support Agent`

**businessName** string

Name of the business this agent represents. Default: Uses location name

**Possible values:** `non-empty`

Example:`Acme Corporation`

**welcomeMessage** string

Initial greeting spoken when the agent answers calls. Default: Auto generated

**Possible values:** `non-empty` and `<= 190 characters`

Example:`Hello! Thank you for calling Acme Corporation. How can I assist you today?`

**agentPrompt** string

Custom instructions defining the agent's behavior and personality. Default: Basic prompt generated automatically

Example:`You are a helpful customer service representative. Always be polite and professional.`

**voiceId** string

Identifier for the speech synthesis voice from available voice options. Default: Auto generated

Example:`507f1f77bcf86cd799439011`

**language** VoiceAILanguage (string)

Language code for the agent's speech and understanding. Default: "en-US"

**Possible values:** \[`en-US`, `pt-BR`, `es`, `fr`, `de`, `it`, `nl-NL`, `multi`\]

Example:`en-US`

**patienceLevel** PatienceLevel (string)

Tolerance level for caller response delays. Default: "high"

**Possible values:** \[`low`, `medium`, `high`\]

Example:`low`

**maxCallDuration** number

Maximum call duration in seconds, between 180-900 (3-15 minutes). Default: 300 seconds (5 minutes)

**Possible values:** `>= 180` and `<= 900`

Example:`600`

**sendUserIdleReminders** boolean

Enables automatic reminders when callers are silent. Default: true

Example:`true`

**reminderAfterIdleTimeSeconds** number

Seconds to wait before sending idle reminders, between 1-20. Default: 8 seconds

**Possible values:** `>= 1` and `<= 20`

Example:`5`

**inboundNumber** string

Phone number for receiving inbound calls to this agent. Default: null

Example:`+1234567890`

**numberPoolId** string

Identifier for the number pool managing phone number allocation. Default: null

Example:`pool_507f1f77bcf86cd799439011`

**callEndWorkflowIds** string\[\]

Array of workflow IDs to trigger automatically when calls end. Default: \[\]

**Possible values:** `<= 10`

Example:`["wf_507f1f77bcf86cd799439011","wf_507f1f77bcf86cd799439012"]`

**sendPostCallNotificationTo** object

Configuration for post-call email notifications to various recipients. Default: \[\]

**admins** booleanrequired

Enables post-call notifications to all admin users in the location. Default: true

Example:`true`

**allUsers** booleanrequired

Enables post-call notifications to all users in the location. Default: false

Example:`false`

**contactAssignedUser** booleanrequired

Enables post-call notifications to the user assigned to the contact. Default: false

Example:`false`

**specificUsers** string\[\]required

Array of specific user IDs to receive post-call notifications. Default: \[\]

Example:`["user_507f1f77bcf86cd799439011"]`

**customEmails** string\[\]required

Array of custom email addresses to receive post-call notifications. Default: \[\]

Example:`["manager@company.com"]`

**agentWorkingHours** object\[\]

Time intervals defining when the agent accepts calls, organized by day of week. Default: \[\] (available 24/7)

*   Array \[
    

**dayOfTheWeek** numberrequired

Day of the week for this working hours configuration (Monday=1 to Sunday=7)

**Possible values:** \[`1`, `2`, `3`, `4`, `5`, `6`, `7`\]

Example:`1`

**intervals** object\[\]required

Array of time intervals when the agent is available on this day

*   Array \[
    

**startHour** numberrequired

Starting hour of the working interval in 24-hour format (0-23)

**Possible values:** `<= 23`

Example:`9`

**endHour** numberrequired

Ending hour of the working interval in 24-hour format (0-23)

**Possible values:** `<= 23`

Example:`17`

**startMinute** numberrequired

Starting minute of the working interval (0-59)

**Possible values:** `<= 59`

Example:`0`

**endMinute** numberrequired

Ending minute of the working interval (0-59)

**Possible values:** `<= 59`

Example:`30`

*   \]
    

*   \]
    

**timezone** string

IANA timezone identifier affecting working hours and scheduling. Default: Location timezone

**Possible values:** Value must match regular expression `^[A-Za-z_]+/[A-Za-z_]+$`

Example:`America/New_York`

**isAgentAsBackupDisabled** boolean

Prevents this agent from being used as a fallback option. Default: false (Available as backup agent)

Example:`false`

**translation** object

Language translation settings including enablement flag and target language code. Rules: (1) translation.enabled can only be true if the agent's language is not en-US; (2) when enabled, translation.language must be either the agent's language or en-US; (3) when enabled, translation.language is required.

**enabled** booleanrequired

Enables language translation for agent conversations. Default: false

Example:`false`

**language** string

Target language code for translation (e.g., "es" for Spanish, "fr" for French).

Example:`es`

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   422

Agent updated successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**id** stringrequired

Unique identifier for the created agent

Example:`507f1f77bcf86cd799439011`

**locationId** stringrequired

Unique identifier for the location where this agent operates

Example:`LOC123456789ABCDEF`

**agentName** stringrequired

Display name of the voice AI agent

Example:`Customer Support Agent`

**businessName** stringrequired

Name of the business this agent represents

Example:`Acme Corporation`

**welcomeMessage** stringrequired

Greeting message spoken when the agent answers calls

Example:`Hello! Thank you for calling. How can I assist you today?`

**agentPrompt** stringrequired

Custom instructions defining the agent's behavior

Example:`You are a helpful customer service representative.`

**voiceId** stringrequired

Identifier for the speech synthesis voice being used

Example:`507f1f77bcf86cd799439011`

**language** stringrequired

Language code for the agent's speech and understanding

Example:`en-US`

**patienceLevel** stringrequired

Current tolerance level for caller response delays

Example:`medium`

**maxCallDuration** numberrequired

Maximum call duration in seconds, between 180-900

**Possible values:** `>= 180` and `<= 900`

Example:`600`

**sendUserIdleReminders** booleanrequired

Indicates whether automatic idle reminders are enabled

Example:`true`

**reminderAfterIdleTimeSeconds** numberrequired

Seconds to wait before sending idle reminders, between 1-20

**Possible values:** `>= 1` and `<= 20`

Example:`5`

**inboundNumber** string

Phone number for receiving inbound calls

Example:`+1234567890`

**numberPoolId** string

Identifier for the number pool managing this agent's phone allocation

Example:`pool_507f1f77bcf86cd799439011`

**callEndWorkflowIds** string\[\]

Array of workflow IDs triggered automatically when calls end

Example:`[]`

**sendPostCallNotificationTo** object

Current post-call notification settings including recipient configuration

**admins** boolean

Send notifications to admins

Example:`true`

**allUsers** boolean

Send notifications to all users

Example:`false`

**contactAssignedUser** boolean

Send notifications to contact assigned user

Example:`false`

**specificUsers** string\[\]

Specific user IDs to notify

Example:`[]`

**customEmails** string\[\]

Custom email addresses to notify

Example:`[]`

**agentWorkingHours** object\[\]

Time intervals when the agent accepts calls, organized by day of week

*   Array \[
    

**dayOfTheWeek** numberrequired

Day of the week for this working hours configuration (Monday=1 to Sunday=7)

**Possible values:** \[`1`, `2`, `3`, `4`, `5`, `6`, `7`\]

Example:`1`

**intervals** object\[\]required

Array of time intervals when the agent is available on this day

*   Array \[
    

**startHour** numberrequired

Starting hour of the working interval in 24-hour format (0-23)

**Possible values:** `<= 23`

Example:`9`

**endHour** numberrequired

Ending hour of the working interval in 24-hour format (0-23)

**Possible values:** `<= 23`

Example:`17`

**startMinute** numberrequired

Starting minute of the working interval (0-59)

**Possible values:** `<= 59`

Example:`0`

**endMinute** numberrequired

Ending minute of the working interval (0-59)

**Possible values:** `<= 59`

Example:`30`

*   \]
    

*   \]
    

**timezone** stringrequired

IANA timezone identifier for working hours and scheduling

Example:`America/New_York`

**isAgentAsBackupDisabled** booleanrequired

Indicates whether this agent is excluded from backup scenarios

Example:`false`

**translation** object

Current language translation settings including enablement status and target language

**enabled** boolean

Whether translation is enabled

Example:`false`

**language** string

Translation language code

Example:`es`

```
{  "id": "507f1f77bcf86cd799439011",  "locationId": "LOC123456789ABCDEF",  "agentName": "Customer Support Agent",  "businessName": "Acme Corporation",  "welcomeMessage": "Hello! Thank you for calling. How can I assist you today?",  "agentPrompt": "You are a helpful customer service representative.",  "voiceId": "507f1f77bcf86cd799439011",  "language": "en-US",  "patienceLevel": "medium",  "maxCallDuration": 600,  "sendUserIdleReminders": true,  "reminderAfterIdleTimeSeconds": 5,  "inboundNumber": "+1234567890",  "numberPoolId": "pool_507f1f77bcf86cd799439011",  "callEndWorkflowIds": [],  "sendPostCallNotificationTo": {    "admins": true,    "allUsers": false,    "contactAssignedUser": false,    "specificUsers": [],    "customEmails": []  },  "agentWorkingHours": [],  "timezone": "America/New_York",  "isAgentAsBackupDisabled": false,  "translation": {    "enabled": false,    "language": "es"  }}
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

**name:** [Authorization](/docs/ghl/voice-ai/voice-ai-api#authentication)**type:** http**scopes:** `voice-ai-agents.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PATCH 'https://services.leadconnectorhq.com/voice-ai/agents/:agentId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "agentName": "Customer Support Agent",  "businessName": "Acme Corporation",  "welcomeMessage": "Hello! Thank you for calling Acme Corporation. How can I assist you today?",  "agentPrompt": "You are a helpful customer service representative. Always be polite and professional.",  "voiceId": "507f1f77bcf86cd799439011",  "language": "en-US",  "patienceLevel": "low",  "maxCallDuration": 600,  "sendUserIdleReminders": true,  "reminderAfterIdleTimeSeconds": 5,  "inboundNumber": "+1234567890",  "numberPoolId": "pool_507f1f77bcf86cd799439011",  "callEndWorkflowIds": [    "wf_507f1f77bcf86cd799439011",    "wf_507f1f77bcf86cd799439012"  ],  "sendPostCallNotificationTo": {    "admins": true,    "allUsers": false,    "contactAssignedUser": false,    "specificUsers": [      "user_507f1f77bcf86cd799439011"    ],    "customEmails": [      "manager@company.com"    ]  },  "agentWorkingHours": [    {      "dayOfTheWeek": 1,      "intervals": [        {          "startHour": 9,          "startMinute": 0,          "endHour": 17,          "endMinute": 30        }      ]    }  ],  "timezone": "America/New_York",  "isAgentAsBackupDisabled": false,  "translation": {    "enabled": false,    "language": "es"  }}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

agentId — pathrequired

locationId — queryrequired

Version — headerrequired

\---2021-04-15

Body required

{
  "agentName": "Customer Support Agent",  "businessName": "Acme Corporation",  "welcomeMessage": "Hello! Thank you for calling Acme Corporation. How can I assist you today?",  "agentPrompt": "You are a helpful customer service representative. Always be polite and professional.",  "voiceId": "507f1f77bcf86cd799439011",  "language": "en-US",  "patienceLevel": "low",  "maxCallDuration": 600,  "sendUserIdleReminders": true,  "reminderAfterIdleTimeSeconds": 5,  "inboundNumber": "+1234567890",  "numberPoolId": "pool\_507f1f77bcf86cd799439011",  "callEndWorkflowIds": \[    "wf\_507f1f77bcf86cd799439011",    "wf\_507f1f77bcf86cd799439012"  \],  "sendPostCallNotificationTo": {    "admins": true,    "allUsers": false,    "contactAssignedUser": false,    "specificUsers": \[      "user\_507f1f77bcf86cd799439011"    \],    "customEmails": \[      "manager@company.com"    \]  },  "agentWorkingHours": \[    {      "dayOfTheWeek": 1,      "intervals": \[        {          "startHour": 9,          "startMinute": 0,          "endHour": 17,          "endMinute": 30        }      \]    }  \],  "timezone": "America/New\_York",  "isAgentAsBackupDisabled": false,  "translation": {    "enabled": false,    "language": "es"  }
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
