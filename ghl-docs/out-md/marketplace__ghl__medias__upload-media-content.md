# https://marketplace.gohighlevel.com/docs/ghl/medias/upload-media-content

# Upload File into Media Library

POST 

## https://services.leadconnectorhq.com/medias/upload-file

If hosted is set to true then fileUrl is required. Else file is required. If adding a file, maximum allowed is 25 MB

### Requirements

#### Scope(s)

`medias.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

*   multipart/form-data

### Body**required**

**file** binary

**hosted** boolean

**fileUrl** string

**name** string

**parentId** string

## Responses[​](#responses "Direct link to Responses")

*   200

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**fileId** stringrequired

ID of the uploaded file

Example:`file.pdf`

**url** stringrequired

Google Cloud Storage URL of the uploaded file

Example:`https://storage.googleapis.com/bucket-name/path/to/file.pdf`

```
{  "fileId": "file.pdf",  "url": "https://storage.googleapis.com/bucket-name/path/to/file.pdf"}
```

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/medias/media-library-api#authentication)**type:** http**scopes:** `medias.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X POST 'https://services.leadconnectorhq.com/medias/upload-file' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

file

file

hosted

fileUrl

name

parentId

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
