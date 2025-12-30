# https://marketplace.gohighlevel.com/docs/webhook/ConversationUnreadWebhook

On this page

Called whenever a conversations unread status is updated

#### Schema[​](#schema "Direct link to Schema")

```
{  "type": "object",  "properties": {    "type": {      "type": "string"    },    "locationId": {      "type": "string"    },    "id": {      "type": "string"    },    "contactId": {      "type": "string"    },    "unreadCount": {      "type": "number"    },    "inbox": {      "type": "boolean"    },    "starred": {      "type": "boolean"    },    "deleted": {      "type": "boolean"    }  }}
```

#### Example[​](#example "Direct link to Example")

```
{  "type": "ConversationUnreadUpdate",  "locationId": "ADVlSQnPsdq3hinusd6C3",  "id": "MzKIpg0rEIH2ZUGKf6BS",  "contactId": "zsYhPBOUsEHtrK508Wm9",  "deleted": false,  "inbox": false,  "starred": true,  "unreadCount": 0}
```

## Share your feedback

★★★★★
