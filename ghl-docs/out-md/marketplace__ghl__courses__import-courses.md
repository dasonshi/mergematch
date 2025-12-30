# https://marketplace.gohighlevel.com/docs/ghl/courses/import-courses

# Import Courses

POST 

## https://services.leadconnectorhq.com/courses/courses-exporter/public/import

Import Courses through public channels

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

**locationId** stringrequired

**userId** string

**products** object\[\]required

*   Array \[
    

**title** stringrequired

**description** stringrequired

**imageUrl** string

**categories** object\[\]required

*   Array \[
    

**title** stringrequired

**visibility** visibility (string)required

**Possible values:** \[`published`, `draft`\]

**thumbnailUrl** string

**posts** object\[\]

*   Array \[
    

**title** stringrequired

**visibility** visibility (string)required

**Possible values:** \[`published`, `draft`\]

**thumbnailUrl** string

**contentType** contentType (string)required

**Possible values:** \[`video`, `assignment`, `quiz`\]

**description** stringrequired

**bucketVideoUrl** string

**postMaterials** object\[\]

*   Array \[
    

**title** stringrequired

**type** type (string)required

**Possible values:** \[`pdf`, `image`, `docx`, `pptx`, `xlsx`, `html`, `dotx`, `epub`, `webp`, `gdoc`, `mp3`, `doc`, `txt`, `zip`, `ppt`, `key`, `htm`, `xls`, `odp`, `odt`, `rtf`, `m4a`, `ods`, `mp4`, `ai`, `avi`, `mov`, `wmv`, `mkv`, `wav`, `flac`, `ogg`, `png`, `jpeg`, `jpg`, `gif`, `bmp`, `tiff`, `svg`, `odg`, `sxw`, `sxc`, `sxi`, `rar`, `7z`, `json`, `xml`, `csv`, `md`, `obj`, `stl`, `woff`, `ttf`\]

**url** stringrequired

*   \]
    

*   \]
    

**subCategories** object\[\]

*   Array \[
    

**title** stringrequired

**visibility** visibility (string)required

**Possible values:** \[`published`, `draft`\]

**thumbnailUrl** string

**posts** object\[\]

*   Array \[
    

**title** stringrequired

**visibility** visibility (string)required

**Possible values:** \[`published`, `draft`\]

**thumbnailUrl** string

**contentType** contentType (string)required

**Possible values:** \[`video`, `assignment`, `quiz`\]

**description** stringrequired

**bucketVideoUrl** string

**postMaterials** object\[\]

*   Array \[
    

**title** stringrequired

**type** type (string)required

**Possible values:** \[`pdf`, `image`, `docx`, `pptx`, `xlsx`, `html`, `dotx`, `epub`, `webp`, `gdoc`, `mp3`, `doc`, `txt`, `zip`, `ppt`, `key`, `htm`, `xls`, `odp`, `odt`, `rtf`, `m4a`, `ods`, `mp4`, `ai`, `avi`, `mov`, `wmv`, `mkv`, `wav`, `flac`, `ogg`, `png`, `jpeg`, `jpg`, `gif`, `bmp`, `tiff`, `svg`, `odg`, `sxw`, `sxc`, `sxi`, `rar`, `7z`, `json`, `xml`, `csv`, `md`, `obj`, `stl`, `woff`, `ttf`\]

**url** stringrequired

*   \]
    

*   \]
    

*   \]
    

*   \]
    

**instructorDetails** object

**name** stringrequired

**description** stringrequired

*   \]
    

## Responses[​](#responses "Direct link to Responses")

*   201

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/courses/memberships-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/courses/courses-exporter/public/import' \-H 'Content-Type: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationId": "string",  "userId": "string",  "products": [    {      "title": "string",      "description": "string",      "imageUrl": "string",      "categories": [        {          "title": "string",          "visibility": "published",          "thumbnailUrl": "string",          "posts": [            {              "title": "string",              "visibility": "published",              "thumbnailUrl": "string",              "contentType": "video",              "description": "string",              "bucketVideoUrl": "string",              "postMaterials": [                {                  "title": "string",                  "type": "pdf",                  "url": "string"                }              ]            }          ],          "subCategories": [            {              "title": "string",              "visibility": "published",              "thumbnailUrl": "string",              "posts": [                {                  "title": "string",                  "visibility": "published",                  "thumbnailUrl": "string",                  "contentType": "video",                  "description": "string",                  "bucketVideoUrl": "string",                  "postMaterials": [                    {                      "title": "string",                      "type": "pdf",                      "url": "string"                    }                  ]                }              ]            }          ]        }      ],      "instructorDetails": {        "name": "string",        "description": "string"      }    }  ]}'
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
  "locationId": "string",  "userId": "string",  "products": \[    {      "title": "string",      "description": "string",      "imageUrl": "string",      "categories": \[        {          "title": "string",          "visibility": "published",          "thumbnailUrl": "string",          "posts": \[            {              "title": "string",              "visibility": "published",              "thumbnailUrl": "string",              "contentType": "video",              "description": "string",              "bucketVideoUrl": "string",              "postMaterials": \[                {                  "title": "string",                  "type": "pdf",                  "url": "string"                }              \]            }          \],          "subCategories": \[            {              "title": "string",              "visibility": "published",              "thumbnailUrl": "string",              "posts": \[                {                  "title": "string",                  "visibility": "published",                  "thumbnailUrl": "string",                  "contentType": "video",                  "description": "string",                  "bucketVideoUrl": "string",                  "postMaterials": \[                    {                      "title": "string",                      "type": "pdf",                      "url": "string"                    }                  \]                }              \]            }          \]        }      \],      "instructorDetails": {        "name": "string",        "description": "string"      }    }  \]
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
