# https://marketplace.gohighlevel.com/docs/ghl/medias/bulk-delete-media-objects

# Bulk Delete / Trash Files or Folders

PUT 

## https://services.leadconnectorhq.com/medias/delete-files

Soft-deletes or trashes multiple files and folders in a single request

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

*   application/json

### Body**required**

**filesToBeDeleted** object\[\]required

Array of file objects to be deleted or trashed

*   Array \[
    

**\_id** stringrequired

Unique identifier of the file or folder to be deleted

Example:`686f630df0d3166d68fbcec2`

*   \]
    

**altType** stringrequired

Type of entity that owns the files

**Possible values:** \[`location`\]

Example:`location`

**altId** stringrequired

Location identifier

Example:`sx6wyHhbFdRXh302LLNR`

**status** stringrequired

Status to set for the files (deleted or trashed)

**Possible values:** \[`deleted`, `trashed`\]

Example:`deleted`

## Responses[​](#responses "Direct link to Responses")

*   200

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

```
[  {    "deleted": true,    "id": "686f630df0d3166d68fbcec2"  }]
```

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/medias/media-library-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PUT 'https://services.leadconnectorhq.com/medias/delete-files' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "filesToBeDeleted": [    {      "_id": "686f630df0d3166d68fbcec2"    }  ],  "altType": "location",  "altId": "sx6wyHhbFdRXh302LLNR",  "status": "deleted"}'
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
  "filesToBeDeleted": \[    {      "\_id": "686f630df0d3166d68fbcec2"    }  \],  "altType": "location",  "altId": "sx6wyHhbFdRXh302LLNR",  "status": "deleted"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
