# https://marketplace.gohighlevel.com/docs/ghl/voice-ai/get-agents

# List Agents

GET 

## https://services.leadconnectorhq.com/voice-ai/agents

Retrieve a paginated list of agents for given location.

### Requirements

#### Scope(s)

`voice-ai-agents.readonly`

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

**page** number

**Possible values:** `>= 1` and `<= 5000`

Page number starting from 1

Default value:`1`

Example: 1

**pageSize** number

**Possible values:** `>= 1` and `<= 50`

Number of items per page

Default value:`10`

Example: 10

**locationId** stringrequired

Location ID

**query** string

Query

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   422

Agent list retrieved successfully.

*   application/json

*   Schema
*   Example (auto)

**Schema**

**total** numberrequired

Total number of items

Example:`150`

**page** numberrequired

Page number starting from 1

Example:`2`

**pageSize** numberrequired

Number of items per page

Example:`10`

**agents** object\[\]required

*   Array \[
    

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

**actions** object\[\]required

Raw actions configured for this agent with complete actionParameters structure

*   Array \[
    

**id** stringrequired

Unique identifier for this action

Example:`507f1f77bcf86cd799439011`

**actionType** stringrequired

Type of action

**Possible values:** \[`CALL_TRANSFER`, `DATA_EXTRACTION`, `IN_CALL_DATA_EXTRACTION`, `WORKFLOW_TRIGGER`, `SMS`, `APPOINTMENT_BOOKING`, `CUSTOM_ACTION`\]

Example:`CALL_TRANSFER`

**name** stringrequired

Human-readable name for this action

Example:`Transfer to Manager`

**actionParameters** objectrequired

Action parameters - structure varies by actionType

oneOf

*   CallTransferActionParameters
*   DataExtractionActionParameters
*   InCallDataExtractionActionParameters
*   WorkflowTriggerParameters
*   SMSParameters
*   AppointmentBookingActionParameters
*   CustomActionParameters

**triggerPrompt** stringrequired

When to trigger this action during the call

Example:`When the caller asks to speak to a manager`

**transferToType** stringrequired

Type of transfer destination (currently only "number" is supported)

**Possible values:** \[`number`\]

Example:`number`

**transferToValue** stringrequired

Phone number to transfer to. Must start with +, include country code, contain only numbers, and be 11-16 characters long (e.g., +12345678901).

Example:`+12345678901`

**triggerMessage** string

Message to tell the caller before transferring

Example:`Let me transfer you to a manager right away`

**hearWhisperMessage** boolean

Whether to play whisper message to the receiving party

Example:`true`

**contactFieldId** stringrequired

ID of the contact field to be updated with the extracted data

Example:`507f1f77bcf86cd799439011`

**description** stringrequired

Description of what data to extract

Example:`Caller's phone number`

**examples** string\[\]required

Example values to help Agent understand the expected format. At least one example is required, maximum 5 examples allowed.

Example:`["+1234567890","+9876543210"]`

**overwriteExistingValue** boolean

Whether to overwrite existing field value if already set, default is false

**Default value:** `false`

Example:`false`

**contactFieldId** stringrequired

ID of the contact field to be updated with the extracted data

Example:`507f1f77bcf86cd799439011`

**description** stringrequired

Description of what data to extract

Example:`Caller's phone number`

**examples** string\[\]required

Example values to help Agent understand the expected format. At least one example is required, maximum 5 examples allowed.

Example:`["+1234567890","+9876543210"]`

**overwriteExistingValue** boolean

Whether to overwrite existing field value if already set, default is false

**Default value:** `false`

Example:`false`

**triggerPrompt** stringrequired

When to trigger this workflow

Example:`When caller requests a quote`

**triggerMessage** stringrequired

Message to tell the caller

Example:`Let me start that process for you`

**workflowId** stringrequired

Workflow ID to trigger

Example:`507f1f77bcf86cd799439011`

**triggerPrompt** stringrequired

When to send the SMS

Example:`When caller asks for booking confirmation`

**triggerMessage** stringrequired

Message to tell the caller

Example:`I'll send you a confirmation text`

**messageBody** stringrequired

SMS message content to send

Example:`Your appointment is confirmed for tomorrow at 2 PM`

**calendarId** stringrequired

Calendar ID to book appointments in

Example:`507f1f77bcf86cd799439011`

**daysOfOfferingDates** numberrequired

Number of days ahead to offer booking dates

Example:`3`

**slotsPerDay** numberrequired

Number of available slots per day

Example:`3`

**hoursBetweenSlots** numberrequired

Hours between available slots

Example:`1`

**triggerPrompt** stringrequired

When to call the custom API

Example:`When caller provides order number`

**triggerMessage** string

Message to tell the caller

Example:`Let me check that order status`

**apiDetails** object

API endpoint configuration

**url** stringrequired

API endpoint URL

Example:`https://api.example.com/orders`

**method** stringrequired

HTTP method

**Possible values:** \[`POST`, `GET`\]

Example:`GET`

**authenticationRequired** boolean

Whether authentication is required

Example:`true`

**authenticationValue** string

Authentication token or API key (required if authenticationRequired is true)

Example:`token123`

**headers** object\[\]

HTTP headers to include

*   Array \[
    

**key** stringrequired

HTTP header name

Example:`id`

**value** stringrequired

HTTP header value

Example:`1234567890`

*   \]
    

**parameters** object\[\]

API parameters to send

*   Array \[
    

**name** stringrequired

Parameter name

Example:`orderId`

**description** string

Parameter description

Example:`Order ID to look up`

**type** string

Parameter type

Example:`string`

**example** string

Example parameter value

Example:`ORD-12345`

*   \]
    

**selectedPaths** string\[\]

Selected response paths to extract from API response. Required: at least 1 value if the method is GET. Should be empty if the method is POST.

Example:`["data.orderId","status"]`

*   \]
    

*   \]
    

```
{  "total": 150,  "page": 2,  "pageSize": 10,  "agents": [    {      "id": "507f1f77bcf86cd799439011",      "locationId": "LOC123456789ABCDEF",      "agentName": "Customer Support Agent",      "businessName": "Acme Corporation",      "welcomeMessage": "Hello! Thank you for calling. How can I assist you today?",      "agentPrompt": "You are a helpful customer service representative.",      "voiceId": "507f1f77bcf86cd799439011",      "language": "en-US",      "patienceLevel": "medium",      "maxCallDuration": 600,      "sendUserIdleReminders": true,      "reminderAfterIdleTimeSeconds": 5,      "inboundNumber": "+1234567890",      "numberPoolId": "pool_507f1f77bcf86cd799439011",      "callEndWorkflowIds": [],      "sendPostCallNotificationTo": {        "admins": true,        "allUsers": false,        "contactAssignedUser": false,        "specificUsers": [],        "customEmails": []      },      "agentWorkingHours": [],      "timezone": "America/New_York",      "isAgentAsBackupDisabled": false,      "translation": {        "enabled": false,        "language": "es"      },      "actions": [        {          "_id": "507f1f77bcf86cd799439011",          "actionType": "CALL_TRANSFER",          "name": "Transfer to Manager",          "actionParameters": {            "triggerPrompt": "When caller asks for manager",            "triggerMessage": "Let me transfer you",            "transferToType": "number",            "transferToValue": "+1234567890"          }        }      ]    }  ]}
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

**name:** [Authorization](/docs/ghl/voice-ai/voice-ai-api#authentication)**type:** http**scopes:** `voice-ai-agents.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/voice-ai/agents' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

page — query

pageSize — query

query — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
