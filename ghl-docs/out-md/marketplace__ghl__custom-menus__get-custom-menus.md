# https://marketplace.gohighlevel.com/docs/ghl/custom-menus/get-custom-menus

# Get Custom Menu Links

GET 

## https://services.leadconnectorhq.com/custom-menus/

Fetches a collection of custom menus based on specified criteria. This endpoint allows clients to retrieve custom menu configurations, which may include menu items, categories, and associated metadata. The response can be tailored using query parameters for filtering, sorting, and pagination.

### Requirements

#### Scope(s)

`custom-menu-link.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Query Parameters

**locationId** string

Unique identifier of the location

Example: 5DP4iH6HLkQsiKESj6rh

**skip** number

Number of items to skip for pagination

Default value:`0`

Example: 0

**limit** number

**Possible values:** `>= 1`

Maximum number of items to return

Default value:`20`

Example: 10

**query** string

Search query to filter custom menus by name, supports partial || full names

Example: custom-menu-link-name

**showOnCompany** boolean

Filter to show only agency-level menu links. When omitted, fetches both agency and sub-account menu links. Ignored if locationId is provided

Example:

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   403
*   422

Successfully retrieved custom menus. Returns an array of custom menu objects, potentially including their structure, items, and relevant metadata.

*   application/json

*   Schema
*   Example (auto)

**Schema**

**customMenus** object\[\]

Array of custom menu links

*   Array \[
    

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

*   \]
    

**totalLinks** number

Total number of custom menu records

Example:`100`

```
{  "customMenus": [    {      "id": "12345",      "icon": {        "name": "yin-yang",        "fontFamily": "fab"      },      "title": "Dashboard",      "url": "/dashboard",      "order": 1,      "showOnCompany": true,      "showOnLocation": true,      "showToAllLocations": true,      "locations": [        "gfWreTIHL8pDbggBb7af",        "67WreTIHL8pDbggBb7ty"      ],      "openMode": "iframe",      "userRole": "all",      "allowCamera": false,      "allowMicrophone": false    }  ],  "totalLinks": 100}
```

Bad Request. Invalid query parameters provided.

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

Forbidden. The client does not have necessary permissions to access custom menus.

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

**name:** [Authorization](/docs/ghl/custom-menus/custom-menus-api#authentication)**type:** http**scopes:** `custom-menu-link.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Agency (OR) Private Integration Token of Agency.

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
curl -L 'https://services.leadconnectorhq.com/custom-menus/' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

Show optional parameters

locationId — query

skip — query

limit — query

query — query

showOnCompany — query

\---truefalse

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
