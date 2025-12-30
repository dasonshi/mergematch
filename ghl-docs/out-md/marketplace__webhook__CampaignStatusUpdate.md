# https://marketplace.gohighlevel.com/docs/webhook/CampaignStatusUpdate

On this page

Called whenever a campaign status is updated

#### Schema[​](#schema "Direct link to Schema")

```
{  "type": "object",  "properties": {    "type": {      "type": "string"    },    "locationId": {      "type": "string"    },    "id": {      "type": "string"    },    "contactId": {      "type": "string"    },    "status": {      "type": "string"    },    "templateId": {      "type": "string"    },    "replied": {      "type": "string"    },    "dateAdded": {      "type": "string"    }  }}
```

#### Example[​](#example "Direct link to Example")

```
{  "type": "CampaignStatusUpdate",  "locationId": "ve9EPM428h8vShlRW1KT",  "id": "2hxvXh8Fjc69SvujEWMD",  "contactId": "CWBf1PR9LvvBkcYqiXlc",  "status": "paused",  "templateId": "Y2I9XM7aO1hncuSOlc9L",  "replied": "Loram ipsum",  "dateAdded": "2021-11-26T12:41:02.193Z"}
```

## Share your feedback

★★★★★
