# https://marketplace.gohighlevel.com/docs/ghl/voice-ai/create-action

# Create Agent Action

POST 

## https://services.leadconnectorhq.com/voice-ai/actions

Create a new action for a voice AI agent. Actions define specific behaviors and capabilities for the agent during calls.

### Requirements

#### Scope(s)

`voice-ai-agent-goals.write`

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

**agentId** stringrequired

Agent ID to attach the action to

Example:`507f1f77bcf86cd799439011`

**locationId** stringrequired

Location ID

Example:`507f1f77bcf86cd799439012`

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

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   422

Action created successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**id** stringrequired

Unique identifier for the created action

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

```
{  "id": "507f1f77bcf86cd799439011",  "actionType": "CALL_TRANSFER",  "name": "Transfer to Manager",  "actionParameters": {    "triggerPrompt": "When the caller asks to speak to a manager",    "transferToType": "number",    "transferToValue": "+12345678901",    "triggerMessage": "Let me transfer you to a manager right away",    "hearWhisperMessage": true  }}
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

**name:** [Authorization](/docs/ghl/voice-ai/voice-ai-api#authentication)**type:** http**scopes:** `voice-ai-agent-goals.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/voice-ai/actions' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "agentId": "507f1f77bcf86cd799439011",  "locationId": "507f1f77bcf86cd799439012",  "actionType": "CALL_TRANSFER",  "name": "Transfer to Manager",  "actionParameters": {    "triggerPrompt": "When the caller asks to speak to a manager",    "transferToType": "number",    "transferToValue": "+12345678901",    "triggerMessage": "Let me transfer you to a manager right away",    "hearWhisperMessage": true  }}'
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
  "agentId": "507f1f77bcf86cd799439011",  "locationId": "507f1f77bcf86cd799439012",  "actionType": "CALL\_TRANSFER",  "name": "Transfer to Manager",  "actionParameters": {    "triggerPrompt": "When the caller asks to speak to a manager",    "transferToType": "number",    "transferToValue": "+12345678901",    "triggerMessage": "Let me transfer you to a manager right away",    "hearWhisperMessage": true  }
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
