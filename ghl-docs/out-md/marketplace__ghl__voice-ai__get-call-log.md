# https://marketplace.gohighlevel.com/docs/ghl/voice-ai/get-call-log

# Get Call Log

GET 

## https://services.leadconnectorhq.com/voice-ai/dashboard/call-logs/:callId

Returns a call log by callId.

### Requirements

#### Scope(s)

`voice-ai-dashboard.readonly`

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

**callId** stringrequired

Call ID

Example: 507f1f77bcf86cd799439011

### Query Parameters

**locationId** stringrequired

Location ID

Example: LOC123456789ABCDEF

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successfully retrieved call log

*   application/json

*   Schema
*   Example (auto)

**Schema**

**id** stringrequired

Unique identifier for the call

Example:`507f1f77bcf86cd799439011`

**contactId** string

Associated contact ID

Example:`507f1f77bcf86cd799439012`

**agentId** stringrequired

Agent ID associated with the call

Example:`507f1f77bcf86cd799439013`

**isAgentDeleted** booleanrequired

Whether the agent is deleted

Example:`false`

**fromNumber** string

Caller phone number

Example:`+1234567890`

**createdAt** date-timerequired

Timestamp when the call was created

Example:`2024-01-15T10:30:00.000Z`

**duration** numberrequired

Call duration in seconds

Example:`180`

**trialCall** booleanrequired

Whether this call was a trial call

Example:`false`

**executedCallActions** object\[\]required

Actions performed during the call

*   Array \[
    

**actionId** string

Action ID reference

Example:`507f1f77bcf86cd799439015`

**actionType** stringrequired

Action type

**Possible values:** \[`CALL_TRANSFER`, `DATA_EXTRACTION`, `IN_CALL_DATA_EXTRACTION`, `WORKFLOW_TRIGGER`, `SMS`, `APPOINTMENT_BOOKING`, `CUSTOM_ACTION`\]

Example:`SMS`

**actionName** stringrequired

Action name

Example:`Send SMS Confirmation`

**description** string

Action description

Example:`When caller asks for booking confirmation`

**actionParameters** object

Action parameters - structure varies by actionType

oneOf

*   CallTransferActionParameters
*   DataExtractionActionParameters
*   InCallDataExtractionActionParameters
*   WorkflowTriggerParameters
*   SMSParameters
*   AppointmentBookingActionParameters
*   CustomActionParameters
*   KnowledgeBaseParameters

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

**triggerPrompt** string

When to query the knowledge base

Example:`When caller asks about pricing`

**triggerMessage** stringrequired

Message to tell the caller

Example:`Let me look that up for you`

**knowledgeBaseId** stringrequired

Knowledge base ID to query

Example:`507f1f77bcf86cd799439011`

**parameters** object\[\]

Additional parameters for the knowledge base query

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
    

**executedAt** date-time

When the action was executed

Example:`2024-01-15T10:32:00.000Z`

**triggerReceivedAt** date-time

When the trigger was received

Example:`2024-01-15T10:31:45.000Z`

*   \]
    

**summary** stringrequired

Call summary

Example:`Customer called to inquire about product pricing and was transferred to sales team.`

**transcript** stringrequired

Call transcript

Example:`bot: Hello, how can I help you today? human: I would like to know about your pricing...`

**translation** object

Transcript translation details

**enabled** boolean

Whether translation is enabled

Example:`false`

**language** string

Translation language code

Example:`es`

**extractedData** object

Dynamic data extracted from the call based on agent configuration

**messageId** string

Message identifier associated with the call

Example:`507f1f77bcf86cd799439014`

```
{  "id": "507f1f77bcf86cd799439011",  "contactId": "507f1f77bcf86cd799439012",  "agentId": "507f1f77bcf86cd799439013",  "isAgentDeleted": false,  "fromNumber": "+1234567890",  "createdAt": "2024-01-15T10:30:00.000Z",  "duration": 180,  "trialCall": false,  "executedCallActions": [    {      "actionId": "507f1f77bcf86cd799439015",      "actionType": "CALL_TRANSFER",      "actionName": "Transfer to Manager",      "description": "Transfers call to a manager when customer requests escalation",      "actionParameters": {        "transferToType": "number",        "transferToValue": "+12345678901",        "triggerMessage": "Let me transfer you to a manager right away",        "hearWhisperMessage": true      },      "executedAt": "2024-01-15T10:32:00.000Z"    },    {      "actionId": "507f1f77bcf86cd799439016",      "actionType": "SMS",      "actionName": "Send Confirmation SMS",      "description": "Sends SMS confirmation to customer",      "actionParameters": {        "triggerPrompt": "When caller asks for booking confirmation",        "triggerMessage": "I'll send you a confirmation text",        "messageBody": "Your appointment is confirmed for tomorrow at 2 PM"      },      "executedAt": "2024-01-15T10:33:30.000Z"    },    {      "actionId": "507f1f77bcf86cd799439017",      "actionType": "DATA_EXTRACTION",      "actionName": "Extract Phone Number",      "description": "Extracts customer phone number for contact record",      "actionParameters": {        "contactFieldId": "507f1f77bcf86cd799439018",        "description": "Customer's phone number",        "examples": [          "+1234567890",          "+9876543210"        ],        "overwriteExistingValue": false      },      "executedAt": "2024-01-15T10:34:15.000Z"    },    {      "actionId": "507f1f77bcf86cd799439019",      "actionType": "WORKFLOW_TRIGGER",      "actionName": "Start Follow-up Workflow",      "description": "Triggers follow-up workflow for lead nurturing",      "actionParameters": {        "triggerPrompt": "When caller requests a quote",        "triggerMessage": "Let me start that process for you",        "workflowId": "507f1f77bcf86cd799439020"      },      "executedAt": "2024-01-15T10:35:00.000Z"    },    {      "actionId": "507f1f77bcf86cd799439021",      "actionType": "APPOINTMENT_BOOKING",      "actionName": "Book Consultation",      "description": "Books consultation appointment with sales team",      "actionParameters": {        "calendarId": "507f1f77bcf86cd799439022",        "daysOfOfferingDates": 3,        "slotsPerDay": 3,        "hoursBetweenSlots": 1      },      "executedAt": "2024-01-15T10:36:45.000Z"    },    {      "actionId": "507f1f77bcf86cd799439023",      "actionType": "CUSTOM_ACTION",      "actionName": "Check Order Status",      "description": "Checks order status via external API",      "actionParameters": {        "triggerPrompt": "When caller provides order number",        "triggerMessage": "Let me check that order status",        "apiDetails": {          "url": "https://api.example.com/orders",          "method": "GET",          "authenticationRequired": true,          "authenticationValue": "token123",          "headers": [            {              "key": "Content-Type",              "value": "application/json"            }          ],          "parameters": [            {              "name": "orderId",              "description": "Order ID to look up",              "type": "string",              "example": "ORD-12345"            }          ]        },        "responsePathsToExtract": [          "data.orderId",          "status"        ]      },      "executedAt": "2024-01-15T10:37:20.000Z"    },    {      "actionId": "507f1f77bcf86cd799439024",      "actionType": "IN_CALL_DATA_EXTRACTION",      "actionName": "Extract Email During Call",      "description": "Extracts customer email during the call",      "actionParameters": {        "contactFieldId": "507f1f77bcf86cd799439025",        "description": "Customer's email address",        "examples": [          "john@example.com",          "jane@company.com"        ],        "overwriteExistingValue": true      },      "executedAt": "2024-01-15T10:31:45.000Z"    },    {      "actionId": "507f1f77bcf86cd799439026",      "actionType": "KNOWLEDGE_BASE",      "actionName": "Query Product Info",      "description": "Queries knowledge base for product information",      "actionParameters": {        "triggerPrompt": "When caller asks about pricing",        "triggerMessage": "Let me look that up for you",        "knowledgeBaseId": "507f1f77bcf86cd799439027",        "parameters": [          {            "name": "category",            "description": "Product category to search",            "type": "string",            "example": "pricing"          }        ]      },      "executedAt": "2024-01-15T10:38:10.000Z"    }  ],  "summary": "Customer called to inquire about product pricing and was transferred to sales team.",  "transcript": "bot: Hello, how can I help you today?\nhuman: I would like to know about your pricing...",  "translation": {    "translatedTranscript": "Translated version of the call transcript"  },  "extractedData": {    "phoneNumber": "+1234567890",    "customerName": "John Doe",    "email": "john.doe@example.com",    "companyName": "Acme Corp",    "customField1": "Custom value",    "customField2": "Another value"  },  "messageId": "507f1f77bcf86cd799439014"}
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

**name:** [Authorization](/docs/ghl/voice-ai/voice-ai-api#authentication)**type:** http**scopes:** `voice-ai-dashboard.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/voice-ai/dashboard/call-logs/:callId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

callId — pathrequired

locationId — queryrequired

Version — headerrequired

\---2021-04-15

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
