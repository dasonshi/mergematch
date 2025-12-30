# https://marketplace.gohighlevel.com/docs/ghl/contacts/create-contact

# Create Contact

POST 

## https://services.leadconnectorhq.com/contacts/

Please find the list of acceptable values for the `country` field [here](https://highlevel.stoplight.io/docs/integrations/ZG9jOjI4MzUzNDIy-country-list)

### Requirements

#### Scope(s)

`contacts.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

*   application/json

### Body**required**

**firstName** stringnullable

Example:`Rosan`

**lastName** stringnullable

Example:`Deo`

**name** stringnullable

Example:`Rosan Deo`

**email** stringnullable

Example:`rosan@deos.com`

**locationId** stringrequired

Example:`ve9EPM428h8vShlRW1KT`

**gender** string

Example:`male`

**phone** stringnullable

Example:`+1 888-888-8888`

**address1** stringnullable

Example:`3535 1st St N`

**city** stringnullable

Example:`Dolomite`

**state** stringnullable

Example:`AL`

**postalCode** string

Example:`35061`

**website** stringnullable

Example:`https://www.tesla.com`

**timezone** stringnullable

Example:`America/Chihuahua`

**dnd** boolean

Example:`true`

**dndSettings** object

**Call** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`, `permanent`\]

**message** string

**code** string

**Email** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`, `permanent`\]

**message** string

**code** string

**SMS** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`, `permanent`\]

**message** string

**code** string

**WhatsApp** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`, `permanent`\]

**message** string

**code** string

**GMB** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`, `permanent`\]

**message** string

**code** string

**FB** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`, `permanent`\]

**message** string

**code** string

**inboundDndSettings** object

**all** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`\]

**message** string

**tags** string\[\]

Example:`["nisi sint commodo amet","consequat"]`

**customFields** object\[\]

*   Array \[
    
anyOf

*   TextField
*   LargeTextField
*   SingleSelectField
*   RadioField
*   NumericField
*   MonetoryField
*   CheckboxField
*   MultiSelectField
*   FileField

**id** stringrequired

Example:`6dvNaf7VhkQ9snc5vnjJ`

**key** string

Example:`my_custom_field`

**field\_value** string

Example:`My Text`

**id** stringrequired

Example:`6dvNaf7VhkQ9snc5vnjJ`

**key** string

Example:`my_custom_field`

**field\_value** string

Example:`My Text`

**id** stringrequired

Example:`6dvNaf7VhkQ9snc5vnjJ`

**key** string

Example:`my_custom_field`

**field\_value** string

Example:`My Selected Option`

**id** stringrequired

Example:`6dvNaf7VhkQ9snc5vnjJ`

**key** string

Example:`my_custom_field`

**field\_value** string

Example:`My Selected Option`

**id** stringrequired

Example:`6dvNaf7VhkQ9snc5vnjJ`

**key** string

Example:`my_custom_field`

**field\_value** object

Example:`100`

**id** stringrequired

Example:`6dvNaf7VhkQ9snc5vnjJ`

**key** string

Example:`my_custom_field`

**field\_value** object

Example:`100.5`

**id** stringrequired

Example:`6dvNaf7VhkQ9snc5vnjJ`

**key** string

Example:`my_custom_field`

**field\_value** string\[\]

Example:`["test","test2"]`

**id** stringrequired

Example:`6dvNaf7VhkQ9snc5vnjJ`

**key** string

Example:`my_custom_field`

**field\_value** string\[\]

Example:`["test","test2"]`

**id** stringrequired

Example:`6dvNaf7VhkQ9snc5vnjJ`

**key** string

Example:`my_custom_field`

**field\_value** object

Example:`{"f31175d4-2b06-4fc6-b7bc-74cd814c68cb":{"meta":{"fieldname":"1HeGizb13P0odwgOgKSs","originalname":"IMG_20231215_164412935.jpg","encoding":"7bit","mimetype":"image/jpeg","size":1786611,"uuid":"f31175d4-2b06-4fc6-b7bc-74cd814c68cb"},"url":"https://services.leadconnectorhq.com/documents/download/w2M9qTZ0ZJz8rGt02jdJ","documentId":"w2M9qTZ0ZJz8rGt02jdJ"}}`

*   \]
    

**source** string

Example:`public api`

**country** string

Example:`US`

**companyName** stringnullable

Example:`DGS VolMAX`

**assignedTo** string

User's Id

Example:`y0BeYjuRIlDwsDcOHOJo`

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

**contact** object

**id** string

Example:`seD4PfOuKoVMLkEZqohJ`

**dateAdded** string

Example:`2021-08-31T09:59:41.937Z`

**dateUpdated** string

Example:`2021-08-31T09:59:41.937Z`

**deleted** boolean

Example:`false`

**tags** string\[\]

Example:`["nisi sint commodo amet","consequat"]`

**type** string

Example:`read`

**customFields** object\[\]

*   Array \[
    

**id** string

Example:`MgobCB14YMVKuE4Ka8p1`

**value** string

Example:`name`

*   \]
    

**locationId** string

Example:`ve9EPM428h8vShlRW1KT`

**firstName** string

Example:`rubika`

**firstNameLowerCase** string

Example:`rubika`

**fullNameLowerCase** string

Example:`rubika deo`

**lastName** string

Example:`Deo`

**lastNameLowerCase** string

Example:`deo`

**email** string

Example:`rubika@deos.com`

**emailLowerCase** string

Example:`rubika@deos.com`

**bounceEmail** boolean

Example:`false`

**unsubscribeEmail** boolean

Example:`false`

**dnd** boolean

Example:`true`

**dndSettings** object

**Call** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`, `permanent`\]

**message** string

**code** string

**Email** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`, `permanent`\]

**message** string

**code** string

**SMS** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`, `permanent`\]

**message** string

**code** string

**WhatsApp** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`, `permanent`\]

**message** string

**code** string

**GMB** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`, `permanent`\]

**message** string

**code** string

**FB** object

**status** stringrequired

**Possible values:** \[`active`, `inactive`, `permanent`\]

**message** string

**code** string

**phone** string

Example:`+18832327657`

**address1** string

Example:`3535 1st St N`

**city** string

Example:`ruDolomitebika`

**state** string

Example:`AL`

**country** string

Example:`US`

**postalCode** string

Example:`35061`

**website** string

Example:`https://www.tesla.com`

**source** string

Example:`public api`

**companyName** string

Example:`DGS VolMAX`

**dateOfBirth** string

Example:`1990-09-25T00:00:00.000Z`

**birthMonth** number

Example:`8`

**birthDay** number

Example:`25`

**lastSessionActivityAt** string

Example:`2021-07-16T11:39:30.564Z`

**offers** string\[\]

Example:`[]`

**products** string\[\]

Example:`[]`

**businessId** string

Example:`641c094001436dbc2081e642`

**assignedTo** string

User's Id

Example:`y0BeYjuRIlDwsDcOHOJo`

```
{  "contact": {    "id": "seD4PfOuKoVMLkEZqohJ",    "dateAdded": "2021-08-31T09:59:41.937Z",    "dateUpdated": "2021-08-31T09:59:41.937Z",    "deleted": false,    "tags": [      "nisi sint commodo amet",      "consequat"    ],    "type": "read",    "customFields": [      {        "id": "MgobCB14YMVKuE4Ka8p1",        "value": "name"      }    ],    "locationId": "ve9EPM428h8vShlRW1KT",    "firstName": "rubika",    "firstNameLowerCase": "rubika",    "fullNameLowerCase": "rubika deo",    "lastName": "Deo",    "lastNameLowerCase": "deo",    "email": "rubika@deos.com",    "emailLowerCase": "rubika@deos.com",    "bounceEmail": false,    "unsubscribeEmail": false,    "dnd": true,    "dndSettings": {      "Call": {        "status": "active",        "message": "string",        "code": "string"      },      "Email": {        "status": "active",        "message": "string",        "code": "string"      },      "SMS": {        "status": "active",        "message": "string",        "code": "string"      },      "WhatsApp": {        "status": "active",        "message": "string",        "code": "string"      },      "GMB": {        "status": "active",        "message": "string",        "code": "string"      },      "FB": {        "status": "active",        "message": "string",        "code": "string"      }    },    "phone": "+18832327657",    "address1": "3535 1st St N",    "city": "ruDolomitebika",    "state": "AL",    "country": "US",    "postalCode": "35061",    "website": "https://www.tesla.com",    "source": "public api",    "companyName": "DGS VolMAX",    "dateOfBirth": "1990-09-25T00:00:00.000Z",    "birthMonth": 8,    "birthDay": 25,    "lastSessionActivityAt": "2021-07-16T11:39:30.564Z",    "offers": [],    "products": [],    "businessId": "641c094001436dbc2081e642",    "assignedTo": "y0BeYjuRIlDwsDcOHOJo"  }}
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

**name:** [Authorization](/docs/ghl/contacts/contacts-api#authentication)**type:** http**scopes:** `contacts.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/contacts/' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "firstName": "Rosan",  "lastName": "Deo",  "name": "Rosan Deo",  "email": "rosan@deos.com",  "locationId": "ve9EPM428h8vShlRW1KT",  "gender": "male",  "phone": "+1 888-888-8888",  "address1": "3535 1st St N",  "city": "Dolomite",  "state": "AL",  "postalCode": "35061",  "website": "https://www.tesla.com",  "timezone": "America/Chihuahua",  "dnd": true,  "dndSettings": {    "Call": {      "status": "active",      "message": "string",      "code": "string"    },    "Email": {      "status": "active",      "message": "string",      "code": "string"    },    "SMS": {      "status": "active",      "message": "string",      "code": "string"    },    "WhatsApp": {      "status": "active",      "message": "string",      "code": "string"    },    "GMB": {      "status": "active",      "message": "string",      "code": "string"    },    "FB": {      "status": "active",      "message": "string",      "code": "string"    }  },  "inboundDndSettings": {    "all": {      "status": "active",      "message": "string"    }  },  "tags": [    "nisi sint commodo amet",    "consequat"  ],  "customFields": [    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my_custom_field",      "field_value": "My Text"    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my_custom_field",      "field_value": "My Text"    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my_custom_field",      "field_value": "My Selected Option"    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my_custom_field",      "field_value": "My Selected Option"    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my_custom_field",      "field_value": 100    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my_custom_field",      "field_value": 100.5    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my_custom_field",      "field_value": [        "test",        "test2"      ]    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my_custom_field",      "field_value": [        "test",        "test2"      ]    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my_custom_field",      "field_value": {        "f31175d4-2b06-4fc6-b7bc-74cd814c68cb": {          "meta": {            "fieldname": "1HeGizb13P0odwgOgKSs",            "originalname": "IMG_20231215_164412935.jpg",            "encoding": "7bit",            "mimetype": "image/jpeg",            "size": 1786611,            "uuid": "f31175d4-2b06-4fc6-b7bc-74cd814c68cb"          },          "url": "https://services.leadconnectorhq.com/documents/download/w2M9qTZ0ZJz8rGt02jdJ",          "documentId": "w2M9qTZ0ZJz8rGt02jdJ"        }      }    }  ],  "source": "public api",  "country": "US",  "companyName": "DGS VolMAX",  "assignedTo": "y0BeYjuRIlDwsDcOHOJo"}'
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
  "firstName": "Rosan",  "lastName": "Deo",  "name": "Rosan Deo",  "email": "rosan@deos.com",  "locationId": "ve9EPM428h8vShlRW1KT",  "gender": "male",  "phone": "+1 888-888-8888",  "address1": "3535 1st St N",  "city": "Dolomite",  "state": "AL",  "postalCode": "35061",  "website": "https://www.tesla.com",  "timezone": "America/Chihuahua",  "dnd": true,  "dndSettings": {    "Call": {      "status": "active",      "message": "string",      "code": "string"    },    "Email": {      "status": "active",      "message": "string",      "code": "string"    },    "SMS": {      "status": "active",      "message": "string",      "code": "string"    },    "WhatsApp": {      "status": "active",      "message": "string",      "code": "string"    },    "GMB": {      "status": "active",      "message": "string",      "code": "string"    },    "FB": {      "status": "active",      "message": "string",      "code": "string"    }  },  "inboundDndSettings": {    "all": {      "status": "active",      "message": "string"    }  },  "tags": \[    "nisi sint commodo amet",    "consequat"  \],  "customFields": \[    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my\_custom\_field",      "field\_value": "My Text"    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my\_custom\_field",      "field\_value": "My Text"    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my\_custom\_field",      "field\_value": "My Selected Option"    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my\_custom\_field",      "field\_value": "My Selected Option"    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my\_custom\_field",      "field\_value": 100    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my\_custom\_field",      "field\_value": 100.5    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my\_custom\_field",      "field\_value": \[        "test",        "test2"      \]    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my\_custom\_field",      "field\_value": \[        "test",        "test2"      \]    },    {      "id": "6dvNaf7VhkQ9snc5vnjJ",      "key": "my\_custom\_field",      "field\_value": {        "f31175d4-2b06-4fc6-b7bc-74cd814c68cb": {          "meta": {            "fieldname": "1HeGizb13P0odwgOgKSs",            "originalname": "IMG\_20231215\_164412935.jpg",            "encoding": "7bit",            "mimetype": "image/jpeg",            "size": 1786611,            "uuid": "f31175d4-2b06-4fc6-b7bc-74cd814c68cb"          },          "url": "https://services.leadconnectorhq.com/documents/download/w2M9qTZ0ZJz8rGt02jdJ",          "documentId": "w2M9qTZ0ZJz8rGt02jdJ"        }      }    }  \],  "source": "public api",  "country": "US",  "companyName": "DGS VolMAX",  "assignedTo": "y0BeYjuRIlDwsDcOHOJo"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
