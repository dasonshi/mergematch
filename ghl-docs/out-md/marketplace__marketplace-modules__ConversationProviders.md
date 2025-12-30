# https://marketplace.gohighlevel.com/docs/marketplace-modules/ConversationProviders

On this page

HighLevel provides conversation providers in marketplace applications for creating custom SMS, Email, and Call providers.

## Setting up Custom Providers[​](#setting-up-custom-providers "Direct link to Setting up Custom Providers")

### Create a Marketplace Application[​](#create-a-marketplace-application "Direct link to Create a Marketplace Application")

First you'll need to create a marketplace application:

1.  Navigate to [https://marketplace.gohighlevel.com](https://marketplace.gohighlevel.com)
2.  Go to the Auth section
3.  Add your scopes (see notes below)
4.  Add redirect, client keys, then click save

### Scopes[​](#scopes "Direct link to Scopes")

Below are the various scopes necessary to use custom conversation providers. Review all scope documentation here: [https://marketplace.gohighlevel.com/docs/oauth/Scopes](https://marketplace.gohighlevel.com/docs/oauth/Scopes)

* * *

Scope

Purpose

conversations/message.write

Conversations Provider Outbound Message Webhook Events, Adding inbound messages. Add external outbound call logs. Upload attachments to conversations. Update message statuses.

conversations.readonly

Query conversations APIs

conversations.write

Create/Update/Delete conversation. One conversationId is maintained per contact.

contacts.readonly, contacts.write

Create/Update contacts

conversations/message.readonly

Recordings/Transcriptions and Outbound Message Webhook Event

* * *

### Conversation Provider Configuration[​](#conversation-provider-configuration "Direct link to Conversation Provider Configuration")

After you create your provider you will have an "ID" which is the "conversationProviderId".

#### SMS (Replace default SMS provider)[​](#sms-replace-default-sms-provider "Direct link to SMS (Replace default SMS provider)")

Description: This enables a SMS provider to replace the default twilio/LC-Phone provider.

1.  Enter a Name
2.  Type: SMS
3.  Delivery URL - Sends webhook events to the Conversation Provider Outbound Webhook

**NOTE:** Do not checkbox "Is this a Custom Conversation Provider"

Add Inbound Message API: Use type "SMS". "conversationProviderId" **is not required**. [https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message](https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message)

Enable The Provider: Navigate to the sub-accounts Settings > Phone Numbers > Advanced Settings > SMS Provider. Click your provider and then click save to save it.

Workflows: Supports standard SMS modules.

Bulk Actions: Supported

#### SMS (Add new conversation channel)[​](#sms-add-new-conversation-channel "Direct link to SMS (Add new conversation channel)")

Description: This adds an additional SMS custom conversation provider.

1.  Enter a Name
2.  Type: SMS
3.  Delivery URL - Sends webhook events to the Conversation Provider Outbound Webhook
4.  Checkbox "Is this a Custom Conversation Provider"
5.  Conversations Tab - Optional - Checkbox "Always show this Conversation Provider" - If you want a tab in the conversations window to respond on the provider.
6.  Alias - Optional - Changes the name of the provider in the conversations tab
7.  Logo - Optional

Add Inbound Message API: Use type "SMS". "conversationProviderId" **is required**. [https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message](https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message)

Enable The Provider: Enabled upon installation. Visit Settings > Conversation Providers to review installed providers.

Workflows: You can build premium workflow actions in your marketplace application. SMS module is not currently supported.

#### Email Provider (default)[​](#email-provider-default "Direct link to Email Provider (default)")

Description: This enables an Email provider to replace the default mailgun/LC-Email provider.

1.  Enter a Name
2.  Type: Email
3.  Delivery URL - Sends webhook events to the Conversation Provider Outbound Webhook

**NOTE:** Do not checkbox "Is this a Custom Conversation Provider"

Add Inbound Message API: Use type "Email". "emailMessageId" in the response is the thread to respond to. "conversationProviderId" **is not required**. [https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message](https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message)

Enable The Provider: Navigate to the sub-accounts Settings > Email Services > Click your provider and then click save to save it.

Workflows: Supports standard Email modules. Triggers are unsupported currently. Use premium workflow actions.

Bulk Actions: Supported

#### Email Provider (extra)[​](#email-provider-extra "Direct link to Email Provider (extra)")

Description: This adds an additional Email custom conversation provider.

1.  Enter a Name
2.  Type: Email
3.  Delivery URL - Sends webhook events to the Conversation Provider Outbound Webhook
4.  Checkbox "Is this a Custom Conversation Provider"
5.  Conversations Tab - Optional - Checkbox "Always show this Conversation Provider" - If you want a tab in the conversations window to respond on the provider.
6.  Alias - Optional - Changes the name of the provider in the conversations tab
7.  Logo - Optional

Add Inbound Message API: Use type "Custom". You can also set "altId". When you reply in the UI the conversation provider outbound payload will add "replyToAltId". "conversationProviderId" **is required**. [https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message](https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message)

Enable The Provider: Enabled upon installation. Visit Settings > Conversation Providers to review installed providers.

Workflows: You can build premium workflow actions in your marketplace application. Triggers and Email modules are unsupported currently.

#### Call Provider[​](#call-provider "Direct link to Call Provider")

Description: This adds a call provider. It is specifically for adding call logs and can also add attachments like voicemails to a conversation. It is not used to replace the voice/SIP connection.

1.  Enter a Name
2.  Type: Call
3.  Delivery URL - Sends webhook events to the Conversation Provider Outbound Webhook

Add Inbound Message API: Use type "Call". Supply the call object payload and ensure the "from" phone matches an existing contact. Used for adding inbound call logs. "conversationProviderId" **is required**. [https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message](https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-inbound-message)

Add an External Outbound Call API: Used to add outbound direction logs. Ensure the "to" phone number matches an existing contact. [https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-outbound-message](https://marketplace.gohighlevel.com/docs/ghl/conversations/add-an-outbound-message)

### Webhook Events[​](#webhook-events "Direct link to Webhook Events")

Conversations Provider Outbound Message Webhook Events [https://marketplace.gohighlevel.com/docs/webhook/ProviderOutboundMessage](https://marketplace.gohighlevel.com/docs/webhook/ProviderOutboundMessage)

Purpose: Outbound events that are distinct from the Outbound Message Event payload.

Outbound Message Events [https://marketplace.gohighlevel.com/docs/webhook/OutboundMessage](https://marketplace.gohighlevel.com/docs/webhook/OutboundMessage)

Purpose: Monitors all outbound messages/channels

## Additional Notes[​](#additional-notes "Direct link to Additional Notes")

### Using Providers[​](#using-providers "Direct link to Using Providers")

1.  Conversations Screen - Navigate to the conversations screen to send/receive messages if a provider is set as the default or if you have enabled the ability to see the provider.
    
2.  Bulk Actions - Only supported on default providers at this time.
    
3.  Workflows - Review notes on currently supported modules.
    
4.  Mobile Application - Select your custom provider depending on type.
    

### Update Message Status API[​](#update-message-status-api "Direct link to Update Message Status API")

Message status updates are only able to be updated by the conversation provider marketplace application tokens. If you have additional marketplace applications installed in your account then they cannot update the message status. [https://marketplace.gohighlevel.com/docs/ghl/conversations/update-message-status](https://marketplace.gohighlevel.com/docs/ghl/conversations/update-message-status)

## Share your feedback

★★★★★
