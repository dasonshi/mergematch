# https://marketplace.gohighlevel.com/docs/Changelog

On this page

## 2025-08-26[​](#2025-08-26 "Direct link to 2025-08-26")

**Conversations**:

Added:

*   response body field `chatWidgetId` added in `getMessage` method (optional)
*   response body array item field `messages.messages[].chatWidgetId` added in `getMessages` method (optional)

**Marketplace**:

Added:

*   request body field `price` added in `charge` method (optional)

Modified:

*   method `getInstallerDetails` endpoint changed from GET /marketplace/app/{appId}/installer-details to GET /marketplace/app/{appId}/installations

**Users**:

Added:

*   path param `userId` is added in `getUser` method (required)
