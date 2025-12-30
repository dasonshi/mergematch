# https://marketplace.gohighlevel.com/docs/webhook/TaskComplete

On this page

Called whenever a task is completed

#### Schema[​](#schema "Direct link to Schema")

```
{  "type": "object",  "properties": {    "type": {      "type": "string"    },    "locationId": {      "type": "string"    },    "id": {      "type": "string"    },    "assignedTo": {      "type": "string"    },    "body": {      "type": "string"    },    "contactId": {      "type": "string"    },    "title": {      "type": "string"    },    "dateAdded": {      "type": "string"    },    "dueDate": {      "type": "string"    }  }}
```

#### Example[​](#example "Direct link to Example")

```
{  "type": "TaskComplete",  "locationId": "ve9EPM428h8vShlRW1KT",  "id": "5HrB1IbmnKMBXloldFuP",  "assignedTo": "bNl8QNGXhIQJLv8eeASQ",  "body": "testing",  "contactId": "WFwVrSSjZ2CNHbZThQX2",  "dateAdded": "2021-11-29T13:37:28.304Z",  "dueDate": "2021-12-22T06:55:00.000Z",  "title": "test"}
```

## Share your feedback

★★★★★
