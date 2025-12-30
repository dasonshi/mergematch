# https://marketplace.gohighlevel.com/docs/ghl/objects/create-custom-object-schema

# Create Custom Object

POST 

## https://services.leadconnectorhq.com/objects/

Allows you to create a custom object schema. To understand objects and records, please have a look at the documentation here : [https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0](https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0)

### Requirements

#### Scope(s)

`objects/schema.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

*   application/json

### Body**required**

**labels** object

This is what your custom object will be called. These labels will be used to display your custom object on the UI

**singular** stringrequired

Singular name of the custom object

Example:`Pet`

**plural** stringrequired

Plural name of the custom object

Example:`Pets`

**key** stringrequired

key that would be used to refer the Custom Object internally (lowercase + underscore\_separated). 'custom\_objects.' would be added as prefix by default

Example:`custom_objects.pet`

**description** string

Pet Object\`s description

Example:`These are non vaccinated pets`

**locationId** stringrequired

Location Id

Example:`ve9EPM428h8vShlRW1KT`

**primaryDisplayPropertyDetails** object

Primary property which will be displayed on the record page

**key** stringrequired

key that would be used to refer the custom field internally (lowercase + underscore\_separated). 'custom\_objects.{{objectKey}}' would be added as prefix by default is not passed

Example:`custom_objects.pet.name`

**name** stringrequired

Name of the Primary property name which will be displayed on the record page

Example:`Pet name`

**dataType** stringrequired

Primary property data Type (it can either be TEXT or NUMERICAL type)

Example:`TEXT`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   422

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**object** object

**id** stringrequired

id of the custom / standard object schema

Example:`661c06b4ffde146bdb469442`

**standard** booleanrequired

false in case of custom objects and true in case of standard objects like contacts and opportunities

Example:`false`

**key** stringrequired

key that would be used to refer the custom / standard Object internally (lowercase + underscore\_separated). For custom objects, 'custom\_objects.' would be added as prefix by default

Example:`custom_objects.pet`

**labels** object

This is what your custom / standard object will be called. These labels will be used to display your custom object on the UI

**singular** stringrequired

Singular name of the custom object

Example:`Pet`

**plural** stringrequired

Plural name of the custom object

Example:`Pets`

**description** string

Custom / Standard Object Descriptions for example , Pet Object\`s description

Example:`These are non vaccinated pets`

**locationId** stringrequired

location's id

Example:`Q9DT3OAqEXDLYuob1G32`

**primaryDisplayProperty** stringrequired

Primary property for the custom / standard Object. This would be used as primary data when rendering the UI. 'custom\_objects.{{object\_key}} or business.{{object\_key}} (for company)' would be added as prefix by default for all the custom / standard objects

Example:`custom_objects.pet.name`

**dateAdded** date-timerequired

Date and time when the object was added

**dateUpdated** date-timerequired

Date and time when the object was last updated

**type** object

Object\`s Type

Example:`The Object type can either USER_DEFINED or SYSTEM_DEFINED`

```
{  "object": {    "id": "661c06b4ffde146bdb469442",    "standard": false,    "key": "custom_objects.pet",    "labels": {      "singular": "Pet",      "plural": "Pets"    },    "description": "These are non vaccinated pets",    "locationId": "Q9DT3OAqEXDLYuob1G32",    "primaryDisplayProperty": "custom_objects.pet.name",    "dateAdded": "2024-07-29T15:51:28.071Z",    "dateUpdated": "2024-07-29T15:51:28.071Z",    "type": "The Object type can either USER_DEFINED or SYSTEM_DEFINED"  }}
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

**name:** [Authorization](/docs/ghl/objects/custom-objects-api#authentication)**type:** http**scopes:** `objects/schema.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Agency (OR) Private Integration Token of Agency.

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
curl -L 'https://services.leadconnectorhq.com/objects/' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "labels": {    "singular": "Pet",    "plural": "Pets"  },  "key": "custom_objects.pet",  "description": "These are non vaccinated pets",  "locationId": "ve9EPM428h8vShlRW1KT",  "primaryDisplayPropertyDetails": {    "key": "custom_objects.pet.name",    "name": "Pet name",    "dataType": "TEXT"  }}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

Version — headerrequired

\---2021-07-28

Body required

{
  "labels": {    "singular": "Pet",    "plural": "Pets"  },  "key": "custom\_objects.pet",  "description": "These are non vaccinated pets",  "locationId": "ve9EPM428h8vShlRW1KT",  "primaryDisplayPropertyDetails": {    "key": "custom\_objects.pet.name",    "name": "Pet name",    "dataType": "TEXT"  }
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
