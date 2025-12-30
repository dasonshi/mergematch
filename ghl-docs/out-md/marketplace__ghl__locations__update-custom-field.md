# https://marketplace.gohighlevel.com/docs/ghl/locations/update-custom-field

# Update Custom Field

PUT 

## https://services.leadconnectorhq.com/locations/:locationId/customFields/:id

Update Custom Field

### Requirements

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

**locationId** stringrequired

Location Id

Example: ve9EPM428h8vShlRW1KT

**id** stringrequired

Custom Field Id

Example: 00NhGCcN1tlO8ZHcu7Wb

*   application/json

### Body**required**

**name** stringrequired

Example:`Custom Field`

**placeholder** string

Example:`Placeholder Text`

**acceptedFormat** string\[\]

Example:`[".pdf",".docx",".jpeg"]`

**isMultipleFile** boolean

Example:`false`

**maxNumberOfFiles** number

Example:`2`

**textBoxListOptions** object\[\]

*   Array \[
    
anyOf

*   textBoxListOptionsSchema
*   textBoxListOptionsSchema

**label** string

Example:`First`

**prefillValue** string

Example:

**label** string

Example:`First`

**prefillValue** string

Example:

*   \]
    

**position** number

**Default value:** `0`

Example:`0`

**model** string

Model of the custom field you want to update

**Possible values:** \[`contact`, `opportunity`\]

Example:`opportunity`

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

**customField** object

**id** string

Example:`3sv6UEo51C9Bmpo1cKTq`

**name** string

Example:`pincode`

**fieldKey** string

Example:`contact.pincode`

**placeholder** string

Example:`Pin code`

**dataType** string

Example:`TEXT`

**position** number

Example:`0`

**picklistOptions** string\[\]

Example:`["first option"]`

**picklistImageOptions** string\[\]

Example:`[]`

**isAllowedCustomOption** boolean

Example:`false`

**isMultiFileAllowed** boolean

Example:`true`

**maxFileLimit** number

Example:`4`

**locationId** string

Example:`3sv6UEo51C9Bmpo1cKTq`

**model** string

Model of the custom field

**Possible values:** \[`contact`, `opportunity`\]

Example:`opportunity`

```
{  "customField": {    "id": "3sv6UEo51C9Bmpo1cKTq",    "name": "pincode",    "fieldKey": "contact.pincode",    "placeholder": "Pin code",    "dataType": "TEXT",    "position": 0,    "picklistOptions": [      "first option"    ],    "picklistImageOptions": [],    "isAllowedCustomOption": false,    "isMultiFileAllowed": true,    "maxFileLimit": 4,    "locationId": "3sv6UEo51C9Bmpo1cKTq",    "model": "opportunity"  }}
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

**name:** [Authorization](/docs/ghl/locations/sub-account-formerly-location-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PUT 'https://services.leadconnectorhq.com/locations/:locationId/customFields/:id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "Custom Field",  "placeholder": "Placeholder Text",  "acceptedFormat": [    ".pdf",    ".docx",    ".jpeg"  ],  "isMultipleFile": false,  "maxNumberOfFiles": 2,  "textBoxListOptions": [    {      "label": "First",      "prefillValue": ""    },    {      "label": "First",      "prefillValue": ""    }  ],  "position": 0,  "model": "opportunity"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — pathrequired

id — pathrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "name": "Custom Field",  "placeholder": "Placeholder Text",  "acceptedFormat": \[    ".pdf",    ".docx",    ".jpeg"  \],  "isMultipleFile": false,  "maxNumberOfFiles": 2,  "textBoxListOptions": \[    {      "label": "First",      "prefillValue": ""    },    {      "label": "First",      "prefillValue": ""    }  \],  "position": 0,  "model": "opportunity"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
