# https://marketplace.gohighlevel.com/docs/webhook/RelationDelete

On this page

## Overview[​](#overview "Direct link to Overview")

This webhook response is triggered when an existing relation between objects is deleted.

For example, in a business management system, a company may want to remove an relation between a custom object record and a contact. In this case:

*   The **first object** (custom object record) could represent an entity such as a project or a transaction.
*   The **second object** (contact) would represent a person associated with the custom object.

## Schema[​](#schema "Direct link to Schema")

The webhook response follows the JSON schema below:

```
{  "type": "object",  "properties": {    "id": {      "type": "string"    },    "firstObjectKey": {      "type": "string"    },    "firstRecordId": {      "type": "string"    },    "secondObjectKey": {      "type": "string"    },    "secondRecordId": {      "type": "string"    },    "associationId": {      "type": "string"    },    "locationId": {      "type": "string"    },  }}
```

## Field Descriptions[​](#field-descriptions "Direct link to Field Descriptions")

### `id`[​](#id "Direct link to id")

*   Type: `string`
*   Unique identifier for the deleted association.

### `firstObjectKey`[​](#firstobjectkey "Direct link to firstobjectkey")

*   Type: `string`
*   Key representing the first object in the association.

### `firstRecordId`[​](#firstrecordid "Direct link to firstrecordid")

*   Type: `string`
*   Identifier of the first object’s specific record.

### `secondObjectKey`[​](#secondobjectkey "Direct link to secondobjectkey")

*   Type: `string`
*   Key representing the second object in the association.

### `secondRecordId`[​](#secondrecordid "Direct link to secondrecordid")

*   Type: `string`
*   Identifier of the second object’s specific record.

### `associationId`[​](#associationid "Direct link to associationid")

*   Type: `string`
*   Unique identifier for the association that was deleted.

### `locationId`[​](#locationid "Direct link to locationid")

*   Type: `string`
*   Identifies the location associated with the deleted association.

## Example Response[​](#example-response "Direct link to Example Response")

```
{  "id": "67ae0d741119d218c9d0c477",  "firstObjectKey": "custom_objects.mad",  "firstRecordId": "67a349a79b28947ec1f65bb5",  "secondObjectKey": "contact",  "secondRecordId": "emqfhnG3g9D9chy9inTz",  "associationId": "669e5795add2094075906c65",  "locationId": "eHy2cOSZxMQzQ6Yyvl8P"}
```

## Additional Notes[​](#additional-notes "Direct link to Additional Notes")

*   The `firstObjectKey` and `secondObjectKey` define the relationship between the deleted entities.

## Share your feedback

★★★★★
