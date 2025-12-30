# https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-csv-post

# Get CSV Post

GET 

## https://services.leadconnectorhq.com/social-media-posting/:locationId/csv/:id

Get CSV Post

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

### Path Parameters

**locationId** stringrequired

Example: sdfdsfdsfEWEsdfsdsW32dd

**id** stringrequired

CSV Id

Example: 65f92e55cc884f0d0845e447

### Query Parameters

**skip** string

Example: 0

**limit** string

Example: 10

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

**success** booleanrequired

Success or Failure

Example:`true`

**statusCode** numberrequired

Status Code

Example:`200`

**message** stringrequired

Message

Example:`Fetched CSV Post`

**results** object

Requested Results

**csv** object

CSV Data

**\_id** stringrequired

Csv Id

Example:`ve9EPM428h8vShlRW1KT`

**locationId** string

locationId

Example:`iVrVJ2uoXNF0wzcBzgl5`

**fileName** string

File Name

Example:`sample.csv`

**accountIds** string\[\]

Account Ids

Example:`["aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"]`

**file** string

File path

Example:`File`

**status** string

status must be one of the following values: pending, in\_progress, completed, failed, in\_review, importing, deleted

Example:`completed`

**count** number

Posts count

Example:`5`

**createdBy** string

Created By Id

Example:`SDsdfdf45Dgs4w3ssss`

**traceId** string

Trace Id

Example:`FSeSDsdfdf45Dgs4w3ssss`

**originId** string

Origin Id

Example:`FSeSDsdfdf45Dgs4w3ssss`

**approver** string

Approver Id

Example:`FSeSDsdfdf45Dgs4w3ssss`

**createdAt** date-time

Date Created

Example:`2023-08-02T00:00:00.000Z`

**count** number

Example:`6`

**posts** object\[\]

CSV Posts

*   Array \[
    

**accountIds** string\[\]

Account Ids

Example:`["aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"]`

**link** object

OG Tag

**url** string

Tag url

Example:`https://knowledge.wharton.upenn.edu/article/impact-of-social-media/`

**ogDescription** string

Tag description

Example:`Social media as we know it has barely`

**ogImage** object

Tag description

**url** string

Image url

Example:`https://knowledge.wharton.upenn.edu/wp-content/uploads/2019/07/072619_socialmedia_phonelikes-600x440.jpg`

**width** number

Image width

Example:`400`

**height** number

Image height

Example:`400`

**type** string

Image Type

Example:`image/jpg`

**ogTitle** string

Tag Title

Example:`The Impact of Social Media: Is it Irreplaceable?`

**ogUrl** string

Tag Url

Example:`https://knowledge.wharton.upenn.edu/article/impact-of-social-media/`

**ogSiteName** string

Site Name

Example:`Knowledge at Wharton`

**error** string

Og Tag Error

Example:`InvalidLink`

**medias** object\[\]

Post Media List

*   Array \[
    

**url** string

Media Url

Example:`https://storage.googleapis.com/ghl-test/omaDY3RbWtTP511e808O/media/38e53059-b92706571605.png`

**type** string

Media Type

Example:`image/webp`

**size** number

Media Size

Example:`18362`

**width** number

Media Width

Example:`500`

**height** number

Media Height

Example:`500`

**aspectRatio** number

Media Aspect Ratio

Example:`1.5`

**duration** number

Media Aspect Ratio

Example:`60`

**format** string

Media format

Example:`jpg`

**videoCodecName** string

Video Codec

Example:`h264`

**frameRate** number

Video Frame Rate

Example:`21`

**audioCodecName** string

Audio Codec

Example:`aac`

**audioChannels** number

Audio Channel

Example:`1`

**displayAspectRatio** string

Display Aspect Ratio

Example:`250 : 167`

**frames** string\[\]

List of frames

**selectedPoster** number

Selected Poster

Example:`0`

**error** string

Error

Example:`Image is larger than 10MB`

**instagramError** string

Instagram media error. It can we one of the following errors: imageSize, imageType, imageAspectRatio, videoType, videoDuration, videoSize, videoAspectRatio, videoWidthHeight, audioCodec, audioCodecChannels, videoCodec, videoFrameRate

Example:`imageSize`

**gmbError** string

GMB media error. It can be one of the following errors: imageSize, imageDimension, imageType

Example:`imageDimension`

**facebookError** string

Facebook media error. It can be one of the following errors: imageSize, imageType, videoDuration, videoSize

Example:`videoDuration`

**linkedinError** string

LinkedIn media error. It can be one of the following errors: imageSize, imageType, videoType, videoDuration, videoSize

Example:`imageType`

**twitterError** string

Twitter media error. It can be one of the following errors: imageSize, videoType, videoDuration, videoSize

Example:`videoSize`

**tiktokError** string

Tiktok media error. It can be one of the following errors: videoType, videoDuration, videoSize, videoWidthHeight, videoCodec, videoFrameRate

Example:`videoFrameRate`

**tiktokBusinessError** string

Tikok Business media error. It can be one of the following errors: videoType, videoDuration, videoSize, videoWidthHeight, videoCodec, videoFrameRate

Example:`videoType`

**invalidError** string

Media error. It can be one of the following values: imageSize, imageWidth

Example:`imageSize`

*   \]
    

**scheduleDate** string

Example:`2022-11-23T05:53:00.000Z`

**summary** string

Example:`First post`

**followUpComment** string

Example:`Initial Comment`

**type** object

Example:`post`

**tiktokPostDetails** object

Tiktok Post Details

**privacyLevel** object

privacy level is an enum and must be one of the following values: PUBLIC\_TO\_EVERYONE, MUTUAL\_FOLLOW\_FRIENDS, SELF\_ONLY

Example:`PUBLIC_TO_EVERYONE`

**promoteOtherBrand** boolean

promote other brand

Example:`true`

**enableComment** boolean

enable comment

Example:`true`

**enableDuet** boolean

enable duet

Example:`true`

**enableStitch** boolean

enable stitch

Example:`true`

**videoDisclosure** boolean

video disclosure

Example:`true`

**promoteYourBrand** boolean

promote your brand

Example:`true`

**gmbPostDetails** object

GMB Post Details

**gmbEventType** string

gmbEventType must be one of the following values: STANDARD, EVENT, OFFER

Example:`STANDARD`

**title** string

Title

Example:`Event Title`

**offerTitle** string

Offer Title

Example:`Hey`

**startDate** object

Start Date

**startDate** object

Start Date

**year** numberrequired

Example:`2022`

**month** numberrequired

Example:`1`

**day** numberrequired

Example:`1`

**startTime** object

Start Time

**hours** numberrequired

Example:`23`

**minutes** numberrequired

Example:`56`

**seconds** numberrequired

Example:`34`

**endDate** object

End Date

**endDate** object

End Date

**year** numberrequired

Example:`2022`

**month** numberrequired

Example:`1`

**day** numberrequired

Example:`1`

**endTime** object

End Time

**hours** numberrequired

Example:`23`

**minutes** numberrequired

Example:`56`

**seconds** numberrequired

Example:`34`

**termsConditions** string

Terms Condition Url

Example:`https://google.com/privacy`

**url** string

Url

Example:`https://google.com`

**couponCode** string

Coupon Code

Example:`BOGO-50`

**redeemOnlineUrl** string

Redeem Online Url

Example:`https://google.com`

**actionType** object

Action Type must be one of the following values: none, order, book, shop, learn\_more, call, sign\_up

Example:`book`

**errorMessage** string

Error Description

*   \]
    

```
{  "success": true,  "statusCode": 200,  "message": "Fetched CSV Post",  "results": {    "csv": {      "_id": "ve9EPM428h8vShlRW1KT",      "locationId": "iVrVJ2uoXNF0wzcBzgl5",      "fileName": "sample.csv",      "accountIds": [        "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"      ],      "file": "File",      "status": "completed",      "count": 5,      "createdBy": "SDsdfdf45Dgs4w3ssss",      "traceId": "FSeSDsdfdf45Dgs4w3ssss",      "originId": "FSeSDsdfdf45Dgs4w3ssss",      "approver": "FSeSDsdfdf45Dgs4w3ssss",      "createdAt": "2023-08-02T00:00:00.000Z"    },    "count": 6,    "posts": [      {        "accountIds": [          "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"        ],        "link": {          "url": "https://knowledge.wharton.upenn.edu/article/impact-of-social-media/",          "ogDescription": "Social media as we know it has barely",          "ogImage": {            "url": "https://knowledge.wharton.upenn.edu/wp-content/uploads/2019/07/072619_socialmedia_phonelikes-600x440.jpg",            "width": 400,            "height": 400,            "type": "image/jpg"          },          "ogTitle": "The Impact of Social Media: Is it Irreplaceable?",          "ogUrl": "https://knowledge.wharton.upenn.edu/article/impact-of-social-media/",          "ogSiteName": "Knowledge at Wharton",          "error": "InvalidLink"        },        "medias": [          {            "url": "https://storage.googleapis.com/ghl-test/omaDY3RbWtTP511e808O/media/38e53059-b92706571605.png",            "type": "image/webp",            "size": 18362,            "width": 500,            "height": 500,            "aspectRatio": 1.5,            "duration": 60,            "format": "jpg",            "videoCodecName": "h264",            "frameRate": 21,            "audioCodecName": "aac",            "audioChannels": 1,            "displayAspectRatio": "250 : 167",            "frames": [              "string"            ],            "selectedPoster": 0,            "error": "Image is larger than 10MB",            "instagramError": "imageSize",            "gmbError": "imageDimension",            "facebookError": "videoDuration",            "linkedinError": "imageType",            "twitterError": "videoSize",            "tiktokError": "videoFrameRate",            "tiktokBusinessError": "videoType",            "invalidError": "imageSize"          }        ],        "scheduleDate": "2022-11-23T05:53:00.000Z",        "summary": "First post",        "followUpComment": "Initial Comment",        "type": "post",        "tiktokPostDetails": {          "privacyLevel": "PUBLIC_TO_EVERYONE",          "promoteOtherBrand": true,          "enableComment": true,          "enableDuet": true,          "enableStitch": true,          "videoDisclosure": true,          "promoteYourBrand": true        },        "gmbPostDetails": {          "gmbEventType": "STANDARD",          "title": "Event Title",          "offerTitle": "Hey",          "startDate": {            "startDate": {              "year": 2022,              "month": 1,              "day": 1            },            "startTime": {              "hours": 23,              "minutes": 56,              "seconds": 34            }          },          "endDate": {            "endDate": {              "year": 2022,              "month": 1,              "day": 1            },            "endTime": {              "hours": 23,              "minutes": 56,              "seconds": 34            }          },          "termsConditions": "https://google.com/privacy",          "url": "https://google.com",          "couponCode": "BOGO-50",          "redeemOnlineUrl": "https://google.com",          "actionType": "book"        },        "errorMessage": "string"      }    ]  }}
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

**name:** [Authorization](/docs/ghl/social-planner/social-media-posting-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/social-media-posting/:locationId/csv/:id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — pathrequired

id — pathrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

skip — query

limit — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
