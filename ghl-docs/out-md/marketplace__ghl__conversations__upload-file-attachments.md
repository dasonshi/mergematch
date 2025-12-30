# https://marketplace.gohighlevel.com/docs/ghl/conversations/upload-file-attachments

# Upload file attachments

POST 

## https://services.leadconnectorhq.com/conversations/messages/upload

Post the necessary fields for the API to upload files. The files need to be a buffer with the key "fileAttachment".  
  
The allowed file types are:  

*   JPG
*   JPEG
*   PNG
*   MP4
*   MPEG
*   ZIP
*   RAR
*   PDF
*   DOC
*   DOCX
*   TXT
*   MP3
*   WAV

  
  
The API will return an object with the URLs

### Requirements

#### Scope(s)

`conversations/message.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-04-15`\]

API Version

*   multipart/form-data

### Body**required**

**conversationId** stringrequired

Conversation Id

Example:`ve9EPM428h8vShlRW1KT`

**locationId** stringrequired

**attachmentUrls** string\[\]required

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401
*   413
*   415

Uploaded the file successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**uploadedFiles** objectrequired

```
{  "uploadedFiles": {}}
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

Payload Too Large

*   application/json

*   Schema
*   Example (auto)

**Schema**

**status** numberrequired

HTTP Status code of the request

**Possible values:** \[`400`, `413`, `415`\]

Example:`413`

**message** stringrequired

Error message of the request

Example:`Failed to upload the files`

```
{  "status": 413,  "message": "Failed to upload the files"}
```

Unsupported Media Type

*   application/json

*   Schema
*   Example (auto)

**Schema**

**status** numberrequired

HTTP Status code of the request

**Possible values:** \[`400`, `413`, `415`\]

Example:`413`

**message** stringrequired

Error message of the request

Example:`Failed to upload the files`

```
{  "status": 413,  "message": "Failed to upload the files"}
```

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/conversations/conversations-api#authentication)**type:** http**scopes:** `conversations/message.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X POST 'https://services.leadconnectorhq.com/conversations/messages/upload' \-H 'Content-Type: multipart/form-data' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

Version — headerrequired

\---2021-04-15

Body required

conversationIdrequired

locationIdrequired

attachmentUrlsrequired

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
