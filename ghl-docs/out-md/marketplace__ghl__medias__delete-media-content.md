# https://marketplace.gohighlevel.com/docs/ghl/medias/delete-media-content

# Delete File or Folder

DELETE 

## https://services.leadconnectorhq.com/medias/:id

Deletes specific file or folder from the media library

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

### Path Parameters

**id** stringrequired

### Query Parameters

**altType** stringrequired

**Possible values:** \[`location`\]

AltType

Example: location

**altId** stringrequired

location Id

## Responses[​](#responses "Direct link to Responses")

*   200

Successful response

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
curl -L -X DELETE 'https://services.leadconnectorhq.com/medias/:id' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

id — pathrequired

altType — queryrequired

\---location

altId — queryrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
