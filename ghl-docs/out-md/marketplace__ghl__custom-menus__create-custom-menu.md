# https://marketplace.gohighlevel.com/docs/ghl/custom-menus/create-custom-menu

# Create Custom Menu Link

POST 

## https://services.leadconnectorhq.com/custom-menus/

Creates a new custom menu for a company. Requires authentication and proper permissions. For Icon Usage Details please refer to [https://doc.clickup.com/8631005/d/h/87cpx-243696/d60fa70db6b92b2](https://doc.clickup.com/8631005/d/h/87cpx-243696/d60fa70db6b92b2)

### Requirements

#### Scope(s)

`custom-menu-link.write`

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

**title** stringrequired

Title of the custom menu

Example:`Custom Menu`

**url** stringrequired

URL of the custom menu

Example:`https://custom-menus.com/`

**icon** object

Icon information for the custom menu

**name** stringrequired

Name of the icon

Example:`yin-yang`

**fontFamily** stringrequired

Font family of the icon

**Possible values:** \[`fab`, `fas`, `far`\]

**showOnCompany** booleanrequired

Whether the menu must be displayed on the agency's level

**Default value:** `true`

Example:`true`

**showOnLocation** booleanrequired

Whether the menu must be displayed for sub-accounts level

**Default value:** `true`

Example:`true`

**showToAllLocations** booleanrequired

Whether the menu must be displayed to all sub-accounts

**Default value:** `true`

Example:`true`

**openMode** stringrequired

Mode for opening the menu link

**Possible values:** \[`iframe`, `new_tab`, `current_tab`\]

**locations** string\[\]required

List of sub-account IDs where the menu should be shown. This list is applicable only when showOnLocation is true and showToAllLocations is false

Example:`["gfWreTIHL8pDbggBb7af","67WreTIHL8pDbggBb7ty"]`

**userRole** stringrequired

Which user-roles should the menu be accessible to?

**Possible values:** \[`all`, `admin`, `user`\]

**allowCamera** boolean

Whether to allow camera access (only for iframe mode)

Example:`false`

**allowMicrophone** boolean

Whether to allow microphone access (only for iframe mode)

Example:`false`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   403
*   422

Custom menu successfully created

*   application/json

*   Schema
*   Example (auto)

**Schema**

**customMenu** object

Single Custom menu link object

**id** string

Unique identifier for the custom menu

Example:`12345`

**icon** object

Icon information for the menu item

**name** string

Name of the icon

Example:`yin-yang`

**fontFamily** string

Font family of the icon

**Possible values:** \[`fab`, `fas`, `far`\]

**title** string

Title of the custom menu

Example:`Dashboard`

**url** string

URL of the custom menu

Example:`/dashboard`

**order** number

Order of the custom menu

Example:`1`

**showOnCompany** boolean

Filter to show only agency-level menu links. When omitted, fetches both agency and sub-account menu links. Ignored if locationId is provided

Example:`true`

**showOnLocation** boolean

Whether the menu must be displayed for sub-accounts level

Example:`true`

**showToAllLocations** boolean

Whether the menu must be displayed to all sub-accounts

Example:`true`

**locations** string\[\]

List of sub-account IDs where the menu should be shown. This list is applicable only when showOnLocation is true and showToAllLocations is false

Example:`["gfWreTIHL8pDbggBb7af","67WreTIHL8pDbggBb7ty"]`

**openMode** string

Mode for opening the menu link

**Possible values:** \[`iframe`, `new_tab`, `current_tab`\]

**userRole** string

Which user-roles should the menu be accessible to?

**Possible values:** \[`all`, `admin`, `user`\]

**allowCamera** boolean

Indicates if camera access is allowed for this menu

Example:`false`

**allowMicrophone** boolean

Indicates if microphone access is allowed for this menu

Example:`false`

```
{  "customMenu": {    "id": "12345",    "icon": {      "name": "yin-yang",      "fontFamily": "fab"    },    "title": "Dashboard",    "url": "/dashboard",    "order": 1,    "showOnCompany": true,    "showOnLocation": true,    "showToAllLocations": true,    "locations": [      "gfWreTIHL8pDbggBb7af",      "67WreTIHL8pDbggBb7ty"    ],    "openMode": "iframe",    "userRole": "all",    "allowCamera": false,    "allowMicrophone": false  }}
```

Bad Request - Invalid input

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

Forbidden - Insufficient permissions

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

**name:** [Authorization](/docs/ghl/custom-menus/custom-menus-api#authentication)**type:** http**scopes:** `custom-menu-link.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Agency (OR) Private Integration Token of Agency.

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
curl -L 'https://services.leadconnectorhq.com/custom-menus/' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "title": "Custom Menu",  "url": "https://custom-menus.com/",  "icon": {    "name": "yin-yang",    "fontFamily": "fab"  },  "showOnCompany": true,  "showOnLocation": true,  "showToAllLocations": true,  "openMode": "iframe",  "locations": [    "gfWreTIHL8pDbggBb7af",    "67WreTIHL8pDbggBb7ty"  ],  "userRole": "all",  "allowCamera": false,  "allowMicrophone": false}'
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
  "title": "Custom Menu",  "url": "https://custom-menus.com/",  "icon": {    "name": "yin-yang",    "fontFamily": "fab"  },  "showOnCompany": true,  "showOnLocation": true,  "showToAllLocations": true,  "openMode": "iframe",  "locations": \[    "gfWreTIHL8pDbggBb7af",    "67WreTIHL8pDbggBb7ty"  \],  "userRole": "all",  "allowCamera": false,  "allowMicrophone": false
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
