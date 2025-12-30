# https://marketplace.gohighlevel.com/docs/webhook/NoteCreate

On this page

Called whenever a note is created

#### Schema[​](#schema "Direct link to Schema")

```
{  "type": "object",  "properties": {    "type": {      "type": "string"    },    "locationId": {      "type": "string"    },    "id": {      "type": "string"    },    "body": {      "type": "string"    },    "contactId": {      "type": "string"    },    "dateAdded": {      "type": "string"    }  }}
```

#### Example[​](#example "Direct link to Example")

```
{  "type": "NoteCreate",  "locationId": "ve9EPM428h8vShlRW1KT",  "id": "otg8dTQqGLh3Q6iQI55w",  "body": "Loram ipsum",  "contactId": "CWBf1PR9LvvBkcYqiXlc",  "dateAdded": "2021-11-26T12:41:02.193Z"}
```

## Share your feedback

★★★★★
