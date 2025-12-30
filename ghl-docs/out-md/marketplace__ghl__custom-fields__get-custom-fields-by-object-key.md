# https://marketplace.gohighlevel.com/docs/ghl/custom-fields/get-custom-fields-by-object-key

# Get Custom Fields By Object Key

GET 

## https://services.leadconnectorhq.com/custom-fields/object-key/:objectKey

Get Custom Fields By Object Key

info

Only supports Custom Objects and Company (Business) today. Will be extended to other Standard Objects in the future.

### Requirements

#### Scope(s)

`locations/customFields.readonly`

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

**objectKey** stringrequired

key of the Object. Must include "custom\_objects." prefix for custom objects. Available on the Custom Objects details Page under settings

Example: custom\_objects.pet

### Query Parameters

**locationId** stringrequired

Example: Location Id

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**fields** object\[\]

Custom Fields for the object.

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
    

**folders** object\[\]

Custom Fields folder for the object.

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
{  "fields": [    {      "locationId": "ve9EPM428h8vShlRW1KT",      "name": "Name",      "description": "string",      "placeholder": "string",      "showInForms": true,      "options": [        {          "key": "string",          "label": "string",          "url": "string"        }      ],      "acceptedFormats": ".pdf",      "id": "string",      "objectKey": "custom_object.pet",      "dataType": "TEXT",      "parentId": "3v34PM428h8vShlRW1KT",      "fieldKey": "custom_object.pet.name",      "allowCustomOption": true,      "maxFileLimit": 2,      "dateAdded": "2024-07-29T15:51:28.071Z",      "dateUpdated": "2024-07-29T15:51:28.071Z"    }  ],  "folders": [    {      "locationId": "ve9EPM428h8vShlRW1KT",      "name": "Name",      "description": "string",      "placeholder": "string",      "showInForms": true,      "options": [        {          "key": "string",          "label": "string",          "url": "string"        }      ],      "acceptedFormats": ".pdf",      "id": "string",      "objectKey": "custom_object.pet",      "dataType": "TEXT",      "parentId": "3v34PM428h8vShlRW1KT",      "fieldKey": "custom_object.pet.name",      "allowCustomOption": true,      "maxFileLimit": 2,      "dateAdded": "2024-07-29T15:51:28.071Z",      "dateUpdated": "2024-07-29T15:51:28.071Z"    }  ]}
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

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/custom-fields/custom-fields-v-2-api#authentication)**type:** http**scopes:** `locations/customFields.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/custom-fields/object-key/:objectKey' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

objectKey — pathrequired

locationId — queryrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
