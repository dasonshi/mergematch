# https://marketplace.gohighlevel.com/docs/ghl/custom-menus/delete-custom-menu

# Delete Custom Menu Link

DELETE 

## https://services.leadconnectorhq.com/custom-menus/:customMenuId

Removes a specific custom menu from the system. This operation requires authentication and proper permissions. The custom menu is identified by its unique ID, and the operation is performed within the context of a specific company.

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

### Path Parameters

**customMenuId** stringrequired

ID of the custom menu to delete

Example: 62e589c1-c456-47e1-a9a7-cb8900014311

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   403
*   404
*   422

Custom menu successfully deleted

*   application/json

*   Schema
*   Example (auto)

**Schema**

**success** boolean

Indicates whether the custom menu was successfully deleted

Example:`true`

**message** string

A message providing additional information about the deletion operation

Example:`Custom menu successfully deleted`

**deletedMenuId** string

The ID of the deleted custom menu

Example:`12345abcde`

**deletedAt** date-time

Timestamp of when the deletion was performed

Example:`2023-09-12T15:30:45.123Z`

```
{  "success": true,  "message": "Custom menu successfully deleted",  "deletedMenuId": "12345abcde",  "deletedAt": "2023-09-12T15:30:45.123Z"}
```

Bad Request. Invalid parameters provided.

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

Forbidden. The client does not have necessary permissions to delete this custom menu.

Not Found. The specified custom menu does not exist or has already been deleted.

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
curl -L -X DELETE 'https://services.leadconnectorhq.com/custom-menus/:customMenuId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

customMenuId — pathrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
