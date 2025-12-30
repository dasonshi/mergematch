# https://marketplace.gohighlevel.com/docs/ghl/objects/get-object-schema-by-key

# Get Object Schema by key / id

GET 

## https://services.leadconnectorhq.com/objects/:key

Retrieve Object Schema by key or ID. This will return the schema of the custom object, including all its fields and properties. Supported objects include contact, opportunity, business and custom objects.To understand objects and records, please have a look the documentation here : [https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0](https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0)

### Requirements

#### Scope(s)

`objects/schema.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Path Parameters

**key** stringrequired

key of the custom or standard object. For custom objects, the key must include the prefix “custom\_objects.”. This key can be found on the Object Details page under Settings in the UI.

Example: custom\_objects.pet

### Query Parameters

**locationId** stringrequired

location id of the sub account

Example: 632c34b4c9b7da3358ac9891

**fetchProperties** string

Fetch Properties , Fetches all the standard / custom fields of the object when set to true

Example:

## Responses[​](#responses "Direct link to Responses")

*   200
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

**cache** booleanrequired

Is the response served from cache

Example:`true`

**fields** object\[\]

*   Array \[
    

**locationId** stringrequired

Location Id

Example:`ve9EPM428h8vShlRW1KT`

**name** string

Field name

Example:`Name`

**description** string

Description of the field

**placeholder** string

Placeholder text for the field

**showInForms** booleanrequired

Whether the field should be shown in forms

**options** object\[\]

Options for the field (Optional, valid only for SINGLE\_OPTIONS, MULTIPLE\_OPTIONS, RADIO, CHECKBOX, TEXTBOX\_LIST type)

*   Array \[
    

**key** stringrequired

Key of the option (Included in Create and Response, excluded in Update)

**label** stringrequired

Value of the option

**url** string

URL associated with the option (Optional, valid only for RADIO type)

*   \]
    

**acceptedFormats** string

Allowed file formats for uploads. Options include: .pdf, .docx, .doc, .jpg, .jpeg, .png, .gif, .csv, .xlsx, .xls, all

**Possible values:** \[`.pdf`, `.docx`, `.doc`, `.jpg`, `.jpeg`, `.png`, `.gif`, `.csv`, `.xlsx`, `.xls`, `all`\]

**id** stringrequired

Unique identifier of the object

**objectKey** stringrequired

The key for your custom / standard object. This key uniquely identifies the custom object. Example: "custom\_object.pet" for a custom object related to pets.

Example:`custom_object.pet`

**dataType** stringrequired

Type of field that you are trying to create

**Possible values:** \[`TEXT`, `LARGE_TEXT`, `NUMERICAL`, `PHONE`, `MONETORY`, `CHECKBOX`, `SINGLE_OPTIONS`, `MULTIPLE_OPTIONS`, `DATE`, `TEXTBOX_LIST`, `FILE_UPLOAD`, `RADIO`\]

**parentId** stringrequired

ID of the parent folder

Example:`3v34PM428h8vShlRW1KT`

**fieldKey** stringrequired

Field key. For Custom Object it's formatted as "custom\_object.{objectKey}.{fieldKey}". "custom\_object" is a fixed prefix, "{objectKey}" is your custom object's identifier, and "{fieldName}" is the unique field name within that object. Example: "custom\_object.pet.name" for a "name" field in a "pet" custom object.

Example:`custom_object.pet.name`

**allowCustomOption** boolean

Determines if users can add a custom option value different from the predefined options in records for RADIO type fields. A custom value added in one record does not automatically become an option and will not appear as an option for other records.

Example:`true`

**maxFileLimit** number

Maximum file limit for uploads

Example:`2`

**dateAdded** date-timerequired

Date and time when the object was added

**dateUpdated** date-timerequired

Date and time when the object was last updated

*   \]
    

```
{  "object": {    "id": "661c06b4ffde146bdb469442",    "standard": false,    "key": "custom_objects.pet",    "labels": {      "singular": "Pet",      "plural": "Pets"    },    "description": "These are non vaccinated pets",    "locationId": "Q9DT3OAqEXDLYuob1G32",    "primaryDisplayProperty": "custom_objects.pet.name",    "dateAdded": "2024-07-29T15:51:28.071Z",    "dateUpdated": "2024-07-29T15:51:28.071Z",    "type": "The Object type can either USER_DEFINED or SYSTEM_DEFINED"  },  "cache": true,  "fields": [    {      "locationId": "ve9EPM428h8vShlRW1KT",      "name": "Name",      "description": "string",      "placeholder": "string",      "showInForms": true,      "options": [        {          "key": "string",          "label": "string",          "url": "string"        }      ],      "acceptedFormats": ".pdf",      "id": "string",      "objectKey": "custom_object.pet",      "dataType": "TEXT",      "parentId": "3v34PM428h8vShlRW1KT",      "fieldKey": "custom_object.pet.name",      "allowCustomOption": true,      "maxFileLimit": 2,      "dateAdded": "2024-07-29T15:51:28.071Z",      "dateUpdated": "2024-07-29T15:51:28.071Z"    }  ]}
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

**name:** [Authorization](/docs/ghl/objects/custom-objects-api#authentication)**type:** http**scopes:** `objects/schema.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/objects/:key' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

key — pathrequired

locationId — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

fetchProperties — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
