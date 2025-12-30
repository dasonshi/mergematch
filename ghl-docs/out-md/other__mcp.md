# https://marketplace.gohighlevel.com/docs/other/mcp

On this page

We’re excited to announce that the GoHighLevel MCP (Model Context Protocol) server is now **live and ready for use!** , opening up a world where advanced AI assistants can talk directly to your GHL data and tools. Think of it as a bridge: you can now **query, automate, and orchestrate** everything in your GoHighLevel account with AI, in any app that supports HTTP based MCP (like Cursor, Windsurf, OpenAI Playground, and more).

**You can also build your own agent. Plug in your favorite AI. Let automation and insights flow.**

# Model Context Protocol (MCP)

MCP is an open protocol that standardizes how applications provide context to LLMs. GHL-MCP provides a standardized way to connect AI models to different data sources and tools without worrying about internal details of how highlevel apis function.

## Quickstart Guide[​](#quickstart-guide "Direct link to Quickstart Guide")

### 1\. **Get Your Private Integration Token (PIT)**[​](#1--get-your-private-integration-token-pit "Direct link to 1--get-your-private-integration-token-pit")

•   Go to **Settings > Private Integrations** in the GoHighLevel Location you want to use.
    
•   Click **“Create New Integration”**, choose the required scopes (see below), and copy the generated token.
    

### 2\. **Configure Your Agent/Client**[​](#2--configure-your-agentclient "Direct link to 2--configure-your-agentclient")

•   Add the MCP endpoint and authentication headers to your agent. The locationId in header is optional - and can be passed as part of prompts as well if needed.

```
{    "mcpServers": {        "ghl-mcp": {            "url": "https://services.leadconnectorhq.com/mcp/",            "headers": {                "Authorization": "Bearer pit-12345",                "locationId": "110411007T"            }        }    }}
```

### 3\. **Start Making Requests**[​](#3--start-making-requests "Direct link to 3--start-making-requests")

•   Use any compatible client or agent to send HTTP requests to the MCP server endpoint.
•   You can now access GHL data using natural language and tool calls.

* * *

#

Tool Name

Endpoint

Description

1

Get Calendar Events

`calendars_get-calendar-events`

Get calendar events (requires userId, groupId, or calendarId)

2

Get Appointment Notes

`calendars_get-appointment-notes`

Retrieve appointment notes

3

Get All Tasks

`contacts_get-all-tasks`

Get all tasks for a contact

4

Add Tags

`contacts_add-tags`

Add tags to a contact

5

Remove Tags

`contacts_remove-tags`

Remove tags from a contact

6

Get Contact

`contacts_get-contact`

Fetch contact details

7

Update Contact

`contacts_update-contact`

Update a contact

8

Upsert Contact

`contacts_upsert-contact`

Update or create a new contact

9

Create Contact

`contacts_create-contact`

Create a contact

10

Get Contacts

`contacts_get-contacts`

Get contacts from GHL

11

Search Conversation

`conversations_search-conversation`

Search/filter/sort conversations

12

Get Messages

`conversations_get-messages`

Get messages by conversation ID

13

Send a New Message

`conversations_send-a-new-message`

Send a message into a conversation thread

14

Get Location

`locations_get-location`

Get sub-account (location) details by ID

15

Get Custom Fields

`locations_get-custom-fields`

Retrieve custom field definitions for a location

16

Search Opportunity

`opportunities_search-opportunity`

Search for opportunities by criteria

17

Get Pipelines

`opportunities_get-pipelines`

Retrieve all opportunity pipelines

18

Get Opportunity

`opportunities_get-opportunity`

Fetch an opportunity by ID

19

Update Opportunity

`opportunities_update-opportunity`

Update an existing opportunity

20

Get Order by ID

`payments_get-order-by-id`

Fetch order details by unique order ID

21

List Transactions

`payments_list-transactions`

Paginated list, supports filtering

* * *

## Authentication & Required Scopes[​](#authentication--required-scopes "Direct link to Authentication & Required Scopes")

> **Note:** For full tool access, your Private Integration Token (PIT) must include the following scopes. else just do the view location scope in combination with required scopes for your AI.

![Required Scopes](https://t8631005.p.clickup-attachments.com/t8631005/f2332fac-ecf7-42a0-b866-a2d029b45625/image.png)

•   View Contacts
    
•   Edit Contacts
    
•   View Conversations
    
•   Edit Conversations
    
•   View Conversation Messages
    
•   Edit Conversation Messages
    
•   View Opportunities
    
•   Edit Opportunities
    
•   View Calendars
    
•   View Payment Orders
    
•   View Custom Fields
    
•   View Payment Transactions
    
•   View Forms
    
•   View Locations
    
•   View Calendar Events
    
•   Edit Calendar Events
    
•   Edit Calendars
    

_You’ll be prompted to select these scopes when creating your Private Integration under Settings > Private Integrations in GoHighLevel._

* * *

## Demo Video of General Setup and usage with OpenAI & Cursor[​](#demo-video-of-general-setup-and-usage-with-openai--cursor "Direct link to Demo Video of General Setup and usage with OpenAI & Cursor")

•   [Demo Video (ClickUp)](https://t8631005.p.clickup-attachments.com/t8631005/e34ef7a7-5b16-4a8b-bcf1-bd85fb3a6319/Demo.mov?view=open)

* * *

## Integration with n8n[​](#integration-with-n8n "Direct link to Integration with n8n")

You can seamlessly integrate the Highlevel MCP server with n8n to automate workflows and connect your GHL data with hundreds of other applications. Here’s how to set it up:

### 1\. Configure the MCP Client in n8n[​](#1-configure-the-mcp-client-in-n8n "Direct link to 1. Configure the MCP Client in n8n")

In your n8n workflow, add the MCP client node and set the MCP URL to `https://services.leadconnectorhq.com/mcp/`. For the transport protocol, select **HTTP Streamable**, which is available in n8n v1.104 and later.

### 2\. Set Up Authentication[​](#2-set-up-authentication "Direct link to 2. Set Up Authentication")

•   Choose **Header based Auth** and provide the following credentials:
    •   **Key**: `Authorization`
    •   **Value**: `Bearer pit-token-here`

### 3\. Provide the Location ID[​](#3-provide-the-location-id "Direct link to 3. Provide the Location ID")

Our MCP server supports dynamic `locationId`s. You can either hardcode it or provide it dynamically:

•   **System Prompt**: For a fixed location, set it in the system prompt of your LLM node:
    
    ```
    The location id is <ghl-location-id-here>
    ```
    
•   **User Prompt**: Alternatively, the tool can request the `locationId` during the conversation, and you can provide it in a chat message.

### 4\. Select Your Tools[​](#4-select-your-tools "Direct link to 4. Select Your Tools")

Once configured, you can select any of the available GHL tools as needed for your workflow.

### Demo Video[​](#demo-video "Direct link to Demo Video")

Watch this demo to see the n8n integration in action: [n8n MCP Integration Demo](https://www.loom.com/share/67b253f6a88a41649361ae06e630b573?sid=ab46ab96-c600-4698-bd84-0a35cca2152b)

* * *

## Sample Langgraph Agent for the MCP[​](#sample-langgraph-agent-for-the-mcp "Direct link to Sample Langgraph Agent for the MCP")

```
import asynciofrom langchain_openai import ChatOpenAIfrom langchain_mcp_adapters.client import MultiServerMCPClientfrom langgraph.prebuilt import create_react_agentasync def main():    client = MultiServerMCPClient(        {            "ghl": {                "url": "https://services.leadconnectorhq.com/mcp/",                "transport": "streamable_http",                "headers": {                    "Authorization": "Bearer pit-token-here",                    "locationId": "location-id-here"                }            }        }    )    tools = await client.get_tools()        # Create OpenAI model with API key    llm = ChatOpenAI(        model="gpt-4o",        api_key="openai-api-key-here"    )        agent = create_react_agent(        llm,        tools    )    response = await agent.ainvoke(        {"messages": [{"role": "user", "content": "Give me all my contacts"}]}    )    print(response)if __name__ == "__main__":    asyncio.run(main())
```

## A few things you can do with this MCP[​](#a-few-things-you-can-do-with-this-mcp "Direct link to A few things you can do with this MCP")

### 1\. **Contact Management on Autopilot**[​](#1--contact-management-on-autopilot "Direct link to 1--contact-management-on-autopilot")

•   Instantly **fetch, update, or create contacts** via AI prompts.
•   **Tag and segment** your contacts for targeted campaigns, all through a chat interface.
•   **Upsert** contacts—AI will figure out if it needs to create or update.

> _**Example:**_ “Show me all contacts added last week and tag them as ‘New Lead’.”

### 2\. **Conversational AI That Can Text for You**[​](#2--conversational-ai-that-can-text-for-you "Direct link to 2--conversational-ai-that-can-text-for-you")

•   **Send new messages** to any conversation using your AI agent—never miss a follow-up.
•   **Search conversations** by keywords, status, or participant.
•   **Auto-reply** to common questions by integrating MCP with your chatbots.

> _**Example:**_ “Find all unread messages and send a follow-up: ‘Hey! Just checking in—let us know if you have questions!’”

### 3\. **Custom Workflows & Multi-Step Automation**[​](#3--custom-workflows--multi-step-automation "Direct link to 3--custom-workflows--multi-step-automation")

•   Chain together multiple MCP actions to create true business workflows on your AI Agents.
    •   **Example:** On new contact creation, tag them, send a welcome message, and add to a pipeline.

### 4\. **Payment & Transaction Intelligence**[​](#4--payment--transaction-intelligence "Direct link to 4--payment--transaction-intelligence")

•   **Fetch order details** and transaction history on demand.
•   Build AI-powered dashboards for payment data analysis.

> _**Example:**_ “Show me the last 10 transactions over $100, and flag any with a refund request.”

* * *

**You can do much more beyond these above examples.**

## Roadmap & Vision[​](#roadmap--vision "Direct link to Roadmap & Vision")

•   npx package for rapid integration with clients that don’t support HTTP Streamable protocol yet (including Claude Desktop).
•   OAuth support.
•   Goal to expand to **250+ tools** as part of a unified orchestrator layer. This will lead to MCP being a single connector with all these capabilities without eating up LLM tokens.
•   Enable full automation, integration, and orchestration across the GoHighLevel ecosystem.

## Try It Out & Feedback[​](#try-it-out--feedback "Direct link to Try It Out & Feedback")

•   Please try out the MCP server—this is our first release and we value your feedback!
•   Integrate with your clients, or create custom agents.
•   For questions or support, feel free to reach out.

## Share your feedback

★★★★★
