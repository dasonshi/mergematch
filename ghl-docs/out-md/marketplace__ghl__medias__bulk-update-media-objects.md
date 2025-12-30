# https://marketplace.gohighlevel.com/docs/ghl/medias/bulk-update-media-objects

# Bulk Update Files/ Folders

PUT 

## https://services.leadconnectorhq.com/medias/update-files

Updates metadata or status of multiple files and folders

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

**altId** stringrequired

Location identifier

Example:`sx6wyHhbFdRXh302LLNR`

**altType** stringrequired

Type of entity that owns the files

**Possible values:** \[`location`\]

Example:`location`

**filesToBeUpdated** object\[\]required

Array of file objects to be updated

*   Array \[
    

**id** stringrequired

Unique identifier of the file or folder to be updated

Example:`686f9817f0d3165be9fbcef6`

**name** string

New name for the file or folder

Example:`Updated File Name.pdf`

*   \]
    

## Responses[​](#responses "Direct link to Responses")

*   200

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

```
[  {    "updated": true,    "id": "686f9817f0d3165be9fbcef6"  }]
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
curl -L -X PUT 'https://services.leadconnectorhq.com/medias/update-files' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "altId": "sx6wyHhbFdRXh302LLNR",  "altType": "location",  "filesToBeUpdated": [    {      "id": "686f9817f0d3165be9fbcef6",      "name": "Updated File Name.pdf"    }  ]}'
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
  "altId": "sx6wyHhbFdRXh302LLNR",  "altType": "location",  "filesToBeUpdated": \[    {      "id": "686f9817f0d3165be9fbcef6",      "name": "Updated File Name.pdf"    }  \]
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
