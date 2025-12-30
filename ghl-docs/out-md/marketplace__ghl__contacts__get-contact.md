# https://marketplace.gohighlevel.com/docs/ghl/contacts/get-contact

# Get Contact

GET 

## https://services.leadconnectorhq.com/contacts/:contactId

Get Contact

### Requirements

#### Scope(s)

`contacts.readonly`

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

**contactId** stringrequired

Contact Id

Example: ocQHyuzHvysMo5N5VsXc

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

**contact** object

**id** string

Example:`seD4PfOuKoVMLkEZqohJ`

**name** string

Example:`rubika deo`

**locationId** string

Example:`ve9EPM428h8vShlRW1KT`

**firstName** string

Example:`rubika`

**lastName** string

Example:`Deo`

**email** string

Example:`rubika@deos.com`

**emailLowerCase** string

Example:`rubika@deos.com`

**timezone** string

Example:

**companyName** string

Example:`DGS VolMAX`

**phone** string

Example:`+18832327657`

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

**type** string

Example:`read`

**source** string

Example:`public api`

**assignedTo** string

Example:`ve9EPM428h8vShlRW1KT`

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

**tags** string\[\]

Example:`["nisi sint commodo amet","consequat"]`

**dateOfBirth** string

Example:`1990-09-25T00:00:00.000Z`

**dateAdded** string

Example:`2021-07-02T05:18:26.704Z`

**dateUpdated** string

Example:`2021-07-02T05:18:26.704Z`

**attachments** string

**ssn** string

**keyword** string

Example:`test`

**firstNameLowerCase** string

Example:`rubika`

**fullNameLowerCase** string

Example:`rubika deo`

**lastNameLowerCase** string

Example:`deo`

**lastActivity** string

Example:`2021-07-16T11:39:30.564Z`

**customFields** object\[\]

*   Array \[
    

**id** string

Example:`MgobCB14YMVKuE4Ka8p1`

**value** string

Example:`name`

*   \]
    

**businessId** string

Example:`641c094001436dbc2081e642`

**attributionSource** object

**url** stringrequired

Example:`Trigger Link`

**campaign** stringnullable

**utmSource** stringnullable

**utmMedium** stringnullable

**utmContent** stringnullable

**referrer** stringnullable

Example:`https: //www.google.com`

**campaignId** stringnullable

**fbclid** stringnullable

**gclid** stringnullable

Example:`CjOKCQjwnNyUBhCZARISAI9AYIFtNnIcWcYGIOQINz_ZoFI5SSLRRugSoPZoiEu27IZBY£1-MAIWmEaAo2VEALW_WCB`

**msclikid** stringnullable

**dclid** stringnullable

**fbc** stringnullable

**fbp** stringnullable

Example:`fb. 1.1674748390986.1171287961`

**fbEventId** stringnullable

Example:`Mozilla/5.0`

**userAgent** stringnullable

Example:`Mozilla/5.0`

**ip** stringnullable

Example:`58.111.106.198`

**medium** stringnullable

Example:`survey`

**mediumId** stringnullable

Example:`FglfHAn30PRwsZVyQlKp`

**lastAttributionSource** object

**url** stringrequired

Example:`Trigger Link`

**campaign** stringnullable

**utmSource** stringnullable

**utmMedium** stringnullable

**utmContent** stringnullable

**referrer** stringnullable

Example:`https: //www.google.com`

**campaignId** stringnullable

**fbclid** stringnullable

**gclid** stringnullable

Example:`CjOKCQjwnNyUBhCZARISAI9AYIFtNnIcWcYGIOQINz_ZoFI5SSLRRugSoPZoiEu27IZBY£1-MAIWmEaAo2VEALW_WCB`

**msclikid** stringnullable

**dclid** stringnullable

**fbc** stringnullable

**fbp** stringnullable

Example:`fb. 1.1674748390986.1171287961`

**fbEventId** stringnullable

Example:`Mozilla/5.0`

**userAgent** stringnullable

Example:`Mozilla/5.0`

**ip** stringnullable

Example:`58.111.106.198`

**medium** stringnullable

Example:`survey`

**mediumId** stringnullable

Example:`FglfHAn30PRwsZVyQlKp`

**visitorId** string

visitorId is the Unique ID assigned to each Live chat visitor.

Example:`ve9EPM428h8vShlRW1KT`

```
{  "contact": {    "id": "seD4PfOuKoVMLkEZqohJ",    "name": "rubika deo",    "locationId": "ve9EPM428h8vShlRW1KT",    "firstName": "rubika",    "lastName": "Deo",    "email": "rubika@deos.com",    "emailLowerCase": "rubika@deos.com",    "timezone": "",    "companyName": "DGS VolMAX",    "phone": "+18832327657",    "dnd": true,    "dndSettings": {      "Call": {        "status": "active",        "message": "string",        "code": "string"      },      "Email": {        "status": "active",        "message": "string",        "code": "string"      },      "SMS": {        "status": "active",        "message": "string",        "code": "string"      },      "WhatsApp": {        "status": "active",        "message": "string",        "code": "string"      },      "GMB": {        "status": "active",        "message": "string",        "code": "string"      },      "FB": {        "status": "active",        "message": "string",        "code": "string"      }    },    "type": "read",    "source": "public api",    "assignedTo": "ve9EPM428h8vShlRW1KT",    "address1": "3535 1st St N",    "city": "ruDolomitebika",    "state": "AL",    "country": "US",    "postalCode": "35061",    "website": "https://www.tesla.com",    "tags": [      "nisi sint commodo amet",      "consequat"    ],    "dateOfBirth": "1990-09-25T00:00:00.000Z",    "dateAdded": "2021-07-02T05:18:26.704Z",    "dateUpdated": "2021-07-02T05:18:26.704Z",    "attachments": "string",    "ssn": "string",    "keyword": "test",    "firstNameLowerCase": "rubika",    "fullNameLowerCase": "rubika deo",    "lastNameLowerCase": "deo",    "lastActivity": "2021-07-16T11:39:30.564Z",    "customFields": [      {        "id": "MgobCB14YMVKuE4Ka8p1",        "value": "name"      }    ],    "businessId": "641c094001436dbc2081e642",    "attributionSource": {      "url": "Trigger Link",      "campaign": "string",      "utmSource": "string",      "utmMedium": "string",      "utmContent": "string",      "referrer": "https: //www.google.com",      "campaignId": "string",      "fbclid": "string",      "gclid": "CjOKCQjwnNyUBhCZARISAI9AYIFtNnIcWcYGIOQINz_ZoFI5SSLRRugSoPZoiEu27IZBY£1-MAIWmEaAo2VEALW_WCB",      "msclikid": "string",      "dclid": "string",      "fbc": "string",      "fbp": "fb. 1.1674748390986.1171287961",      "fbEventId": "Mozilla/5.0",      "userAgent": "Mozilla/5.0",      "ip": "58.111.106.198",      "medium": "survey",      "mediumId": "FglfHAn30PRwsZVyQlKp"    },    "lastAttributionSource": {      "url": "Trigger Link",      "campaign": "string",      "utmSource": "string",      "utmMedium": "string",      "utmContent": "string",      "referrer": "https: //www.google.com",      "campaignId": "string",      "fbclid": "string",      "gclid": "CjOKCQjwnNyUBhCZARISAI9AYIFtNnIcWcYGIOQINz_ZoFI5SSLRRugSoPZoiEu27IZBY£1-MAIWmEaAo2VEALW_WCB",      "msclikid": "string",      "dclid": "string",      "fbc": "string",      "fbp": "fb. 1.1674748390986.1171287961",      "fbEventId": "Mozilla/5.0",      "userAgent": "Mozilla/5.0",      "ip": "58.111.106.198",      "medium": "survey",      "mediumId": "FglfHAn30PRwsZVyQlKp"    },    "visitorId": "ve9EPM428h8vShlRW1KT"  }}
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

**name:** [Authorization](/docs/ghl/contacts/contacts-api#authentication)**type:** http**scopes:** `contacts.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/contacts/:contactId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

contactId — pathrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
