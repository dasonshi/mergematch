# https://marketplace.gohighlevel.com/docs/ghl/social-planner/edit-post

# Edit post

PUT 

## https://services.leadconnectorhq.com/social-media-posting/:locationId/posts/:id

Create posts for all supported platforms. It is possible to create customized posts per channel by using the same platform account IDs in a request and hitting the create post API multiple times with different summaries and account IDs per platform.

The content and media limitations, as well as platform rate limiters corresponding to the respective platforms, are provided in the following reference link:

Link: [Platform Limitations](https://help.leadconnectorhq.com/support/solutions/articles/48001240003-social-planner-image-video-content-and-api-limitations "Social Planner Help")

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

Location Id

Example: ve9EPM428h8vShlRW1KT

**id** stringrequired

Post Id

Example: 65fac446d599990d1313c1dd

*   application/json

### Body**required**

**accountIds** string\[\]

Account Ids

Example:`["aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"]`

**summary** string

Post Content The limitations of content as per the platforms is provided through the reference link in API description

Example:`Hello World`

**media** object\[\]

Post Media Data The limitations of media as per the platforms is provided through the reference link in API description

*   Array \[
    

**url** stringrequired

Example:`https://i0.wp.com/www.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg`

**caption** string

Example:`Caption 1`

**type** string

Example:`video/mp4 or image/png`

**thumbnail** string

Example:`https://storage.googleapis.com/test/test/media/test.jpeg`

**defaultThumb** string

Example:`https://storage.googleapis.com/test/test/media/test.jpeg`

**id** string

Example:`Edf3323fsfsdsd`

*   \]
    

**status** object

Status must be one of the following values: in\_progress, draft, failed, published, scheduled, in\_review, notification\_sent, deleted

Example:`draft`

**scheduleDate** string

Schedule Date

**createdBy** string

Created By

**followUpComment** string

Follow Up Comment on platform. It is not allowed on Tiktok and GMB accounts and there is a limit of 280 charecters for twitter account

Example:`First comment`

**ogTagsDetails** object

Og Tags Meta Data

**metaImage** string

Meta Image

Example:`https://wwww.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg`

**metaLink** string

Meta Link

**type** objectrequired

Post Type must be one of the following values: - post, story, reel

Example:`post`

**postApprovalDetails** object

Post Approval Details

**approver** string

Approver

Example:`iVrVJ2uoXNF0wzcBzgl5`

**requesterNote** string

Requester Notes

Example:`Test suggestion`

**approverNote** string

Approver Notes

Example:`Test suggestion`

**approvalStatus** object

Approval Status must be one of the following values: pending, approved, rejected, not\_required

Example:`approved`

**scheduleTimeUpdated** boolean

if schedule datetime is updated

Example:`true`

**tags** string\[\]

Array of Tag Value

Example:`["Tag1"]`

**categoryId** string

Category Id

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

**userId** string

User ID

Example:`sdfdsfdsfEWEsdfsdsW32dd`

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

Example:`Updated Post`

```
{  "success": true,  "statusCode": 200,  "message": "Updated Post"}
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
curl -L -X PUT 'https://services.leadconnectorhq.com/social-media-posting/:locationId/posts/:id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "accountIds": [    "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"  ],  "summary": "Hello World",  "media": [    {      "url": "https://i0.wp.com/www.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg",      "caption": "Caption 1",      "type": "video/mp4 or image/png",      "thumbnail": "https://storage.googleapis.com/test/test/media/test.jpeg",      "defaultThumb": "https://storage.googleapis.com/test/test/media/test.jpeg",      "id": "Edf3323fsfsdsd"    }  ],  "status": "draft",  "scheduleDate": "string",  "createdBy": "string",  "followUpComment": "First comment",  "ogTagsDetails": {    "metaImage": "https://wwww.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg",    "metaLink": "string"  },  "type": "post",  "postApprovalDetails": {    "approver": "iVrVJ2uoXNF0wzcBzgl5",    "requesterNote": "Test suggestion",    "approverNote": "Test suggestion",    "approvalStatus": "approved"  },  "scheduleTimeUpdated": true,  "tags": [    "Tag1"  ],  "categoryId": "string",  "tiktokPostDetails": {    "privacyLevel": "PUBLIC_TO_EVERYONE",    "promoteOtherBrand": true,    "enableComment": true,    "enableDuet": true,    "enableStitch": true,    "videoDisclosure": true,    "promoteYourBrand": true  },  "gmbPostDetails": {    "gmbEventType": "STANDARD",    "title": "Event Title",    "offerTitle": "Hey",    "startDate": {      "startDate": {        "year": 2022,        "month": 1,        "day": 1      },      "startTime": {        "hours": 23,        "minutes": 56,        "seconds": 34      }    },    "endDate": {      "endDate": {        "year": 2022,        "month": 1,        "day": 1      },      "endTime": {        "hours": 23,        "minutes": 56,        "seconds": 34      }    },    "termsConditions": "https://google.com/privacy",    "url": "https://google.com",    "couponCode": "BOGO-50",    "redeemOnlineUrl": "https://google.com",    "actionType": "book"  },  "userId": "sdfdsfdsfEWEsdfsdsW32dd"}'
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

Body required

{
  "accountIds": \[    "aF3KhyL8JIuBwzK3m7Ly\_iVrVJ2uoXNF0wzcBzgl5\_12554616564525983496"  \],  "summary": "Hello World",  "media": \[    {      "url": "https://i0.wp.com/www.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg",      "caption": "Caption 1",      "type": "video/mp4 or image/png",      "thumbnail": "https://storage.googleapis.com/test/test/media/test.jpeg",      "defaultThumb": "https://storage.googleapis.com/test/test/media/test.jpeg",      "id": "Edf3323fsfsdsd"    }  \],  "status": "draft",  "scheduleDate": "string",  "createdBy": "string",  "followUpComment": "First comment",  "ogTagsDetails": {    "metaImage": "https://wwww.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg",    "metaLink": "string"  },  "type": "post",  "postApprovalDetails": {    "approver": "iVrVJ2uoXNF0wzcBzgl5",    "requesterNote": "Test suggestion",    "approverNote": "Test suggestion",    "approvalStatus": "approved"  },  "scheduleTimeUpdated": true,  "tags": \[    "Tag1"  \],  "categoryId": "string",  "tiktokPostDetails": {    "privacyLevel": "PUBLIC\_TO\_EVERYONE",    "promoteOtherBrand": true,    "enableComment": true,    "enableDuet": true,    "enableStitch": true,    "videoDisclosure": true,    "promoteYourBrand": true  },  "gmbPostDetails": {    "gmbEventType": "STANDARD",    "title": "Event Title",    "offerTitle": "Hey",    "startDate": {      "startDate": {        "year": 2022,        "month": 1,        "day": 1      },      "startTime": {        "hours": 23,        "minutes": 56,        "seconds": 34      }    },    "endDate": {      "endDate": {        "year": 2022,        "month": 1,        "day": 1      },      "endTime": {        "hours": 23,        "minutes": 56,        "seconds": 34      }    },    "termsConditions": "https://google.com/privacy",    "url": "https://google.com",    "couponCode": "BOGO-50",    "redeemOnlineUrl": "https://google.com",    "actionType": "book"  },  "userId": "sdfdsfdsfEWEsdfsdsW32dd"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
