# https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-post

# Create post

POST 

## https://services.leadconnectorhq.com/social-media-posting/:locationId/posts

Create posts for all supported platforms. It is possible to create customized posts per channel by using the same platform account IDs in a request and hitting the create post API multiple times with different summaries and account IDs per platform.

The content and media limitations, as well as platform rate limiters corresponding to the respective platforms, are provided in the following reference link:

Link: [Platform Limitations](https://help.leadconnectorhq.com/support/solutions/articles/48001240003-social-planner-image-video-content-and-api-limitations "Social Planner Help")

### Requirements

#### Scope(s)

`socialplanner/post.write`

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

*   application/json

### Body**required**

**accountIds** string\[\]required

Account Ids

Example:`["aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"]`

**summary** string

Post Content The limitations of content as per the platforms is provided through the reference link in API description. The summary will be trimmed based on the limit

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

Status must be one of the following values: null, in\_progress, draft, failed, published, scheduled, in\_review, notification\_sent, deleted

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

Example:`["65f151c99bc2bf3aaf970d72"]`

**categoryId** string

Category Id

Example:`65f151c99bc2bf3aaf970d72`

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

**userId** stringrequired

User ID

Example:`sdfdsfdsfEWEsdfsdsW32dd`

## Responses[​](#responses "Direct link to Responses")

*   201
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

Example:`201`

**message** stringrequired

Message

Example:`Created Post`

**results** object

Requested Results

**post** object

Post Data

**\_id** string

Example:`61bb16833b3f2791f9715be2`

**source** string

source must be one of the following values: composer, recurring, csv

**Possible values:** \[`composer`, `csv`, `recurring`, `review`, `rss`\]

Example:`composer`

**locationId** stringrequired

Location Id

Example:`ve9EPM428h8vShlRW1KT`

**platform** string

platform must be one of the following values: google, facebook, instagram, linkedin, twitter, tiktok

Example:`google`

**displayDate** date-time

Example:`2023-08-02T00:00:00.000Z`

**createdAt** date-time

Example:`2023-08-02T00:00:00.000Z`

**updatedAt** date-time

Example:`2023-08-02T00:00:00.000Z`

**accountId** string

Account Id

Example:`w37swmmLbA02zgqKPpxITe`

**error** stringrequired

Error

Example:`Failed due to auth token`

**postId** string

Example:`323534534435`

**publishedAt** string

Example:`2021-06-22T05:32:49.463Z`

**accountIds** string\[\]

Account Ids

Example:`["aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"]`

**summary** string

Example:`Sample Summary`

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

Example:`published`

**createdBy** string

Example:`Lx1EI6YIgQYMQi0ytFXv`

**type** objectrequired

Post Type must be one of the following values: - post, story, reel

Example:`post`

**tags** string\[\]

Tag Ids

Example:`["aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"]`

**ogTagsDetails** object

Og Tags Meta Data

**metaImage** string

Meta Image

Example:`https://wwww.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg`

**metaLink** string

Meta Link

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

**approverUser** object

Approver User Details

**id** stringrequired

User Id

Example:`6284c43d519161e96cc09c13`

**title** stringrequired

Title

Example:`Mr`

**firstName** stringrequired

First name

Example:`Harry`

**lastName** stringrequired

Last name

Example:`Spencer`

**profilePhoto** stringrequired

Profile photo

Example:`https://storage.googleapis.com/user/kCrjKGHZQ2/profile/1dca8c-61c9-404d-a459-751fbcb.jpeg`

**phone** stringrequired

Phone number

Example:`901111119`

**email** stringrequired

Email Id

Example:`abc@xyc.com`

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

**user** object

User

**id** stringrequired

User Id

Example:`6284c43d519161e96cc09c13`

**title** stringrequired

Title

Example:`Mr`

**firstName** stringrequired

First name

Example:`Harry`

**lastName** stringrequired

Last name

Example:`Spencer`

**profilePhoto** stringrequired

Profile photo

Example:`https://storage.googleapis.com/user/kCrjKGHZQ2/profile/1dca8c-61c9-404d-a459-751fbcb.jpeg`

**phone** stringrequired

Phone number

Example:`901111119`

**email** stringrequired

Email Id

Example:`abc@xyc.com`

```
{  "success": true,  "statusCode": 201,  "message": "Created Post",  "results": {    "post": {      "_id": "61bb16833b3f2791f9715be2",      "source": "composer",      "locationId": "ve9EPM428h8vShlRW1KT",      "platform": "google",      "displayDate": "2023-08-02T00:00:00.000Z",      "createdAt": "2023-08-02T00:00:00.000Z",      "updatedAt": "2023-08-02T00:00:00.000Z",      "accountId": "w37swmmLbA02zgqKPpxITe",      "error": "Failed due to auth token",      "postId": "323534534435",      "publishedAt": "2021-06-22T05:32:49.463Z",      "accountIds": [        "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"      ],      "summary": "Sample Summary",      "media": [        {          "url": "https://i0.wp.com/www.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg",          "caption": "Caption 1",          "type": "video/mp4 or image/png",          "thumbnail": "https://storage.googleapis.com/test/test/media/test.jpeg",          "defaultThumb": "https://storage.googleapis.com/test/test/media/test.jpeg",          "id": "Edf3323fsfsdsd"        }      ],      "status": "published",      "createdBy": "Lx1EI6YIgQYMQi0ytFXv",      "type": "post",      "tags": [        "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"      ],      "ogTagsDetails": {        "metaImage": "https://wwww.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg",        "metaLink": "string"      },      "postApprovalDetails": {        "approver": "iVrVJ2uoXNF0wzcBzgl5",        "requesterNote": "Test suggestion",        "approverNote": "Test suggestion",        "approvalStatus": "approved",        "approverUser": {          "id": "6284c43d519161e96cc09c13",          "title": "Mr",          "firstName": "Harry",          "lastName": "Spencer",          "profilePhoto": "https://storage.googleapis.com/user/kCrjKGHZQ2/profile/1dca8c-61c9-404d-a459-751fbcb.jpeg",          "phone": "901111119",          "email": "abc@xyc.com"        }      },      "tiktokPostDetails": {        "privacyLevel": "PUBLIC_TO_EVERYONE",        "promoteOtherBrand": true,        "enableComment": true,        "enableDuet": true,        "enableStitch": true,        "videoDisclosure": true,        "promoteYourBrand": true      },      "gmbPostDetails": {        "gmbEventType": "STANDARD",        "title": "Event Title",        "offerTitle": "Hey",        "startDate": {          "startDate": {            "year": 2022,            "month": 1,            "day": 1          },          "startTime": {            "hours": 23,            "minutes": 56,            "seconds": 34          }        },        "endDate": {          "endDate": {            "year": 2022,            "month": 1,            "day": 1          },          "endTime": {            "hours": 23,            "minutes": 56,            "seconds": 34          }        },        "termsConditions": "https://google.com/privacy",        "url": "https://google.com",        "couponCode": "BOGO-50",        "redeemOnlineUrl": "https://google.com",        "actionType": "book"      },      "user": {        "id": "6284c43d519161e96cc09c13",        "title": "Mr",        "firstName": "Harry",        "lastName": "Spencer",        "profilePhoto": "https://storage.googleapis.com/user/kCrjKGHZQ2/profile/1dca8c-61c9-404d-a459-751fbcb.jpeg",        "phone": "901111119",        "email": "abc@xyc.com"      }    }  }}
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

**name:** [Authorization](/docs/ghl/social-planner/social-media-posting-api#authentication)**type:** http**scopes:** `socialplanner/post.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/social-media-posting/:locationId/posts' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "accountIds": [    "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"  ],  "summary": "Hello World",  "media": [    {      "url": "https://i0.wp.com/www.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg",      "caption": "Caption 1",      "type": "video/mp4 or image/png",      "thumbnail": "https://storage.googleapis.com/test/test/media/test.jpeg",      "defaultThumb": "https://storage.googleapis.com/test/test/media/test.jpeg",      "id": "Edf3323fsfsdsd"    }  ],  "status": "draft",  "scheduleDate": "string",  "createdBy": "string",  "followUpComment": "First comment",  "ogTagsDetails": {    "metaImage": "https://wwww.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg",    "metaLink": "string"  },  "type": "post",  "postApprovalDetails": {    "approver": "iVrVJ2uoXNF0wzcBzgl5",    "requesterNote": "Test suggestion",    "approverNote": "Test suggestion",    "approvalStatus": "approved"  },  "scheduleTimeUpdated": true,  "tags": [    "65f151c99bc2bf3aaf970d72"  ],  "categoryId": "65f151c99bc2bf3aaf970d72",  "tiktokPostDetails": {    "privacyLevel": "PUBLIC_TO_EVERYONE",    "promoteOtherBrand": true,    "enableComment": true,    "enableDuet": true,    "enableStitch": true,    "videoDisclosure": true,    "promoteYourBrand": true  },  "gmbPostDetails": {    "gmbEventType": "STANDARD",    "title": "Event Title",    "offerTitle": "Hey",    "startDate": {      "startDate": {        "year": 2022,        "month": 1,        "day": 1      },      "startTime": {        "hours": 23,        "minutes": 56,        "seconds": 34      }    },    "endDate": {      "endDate": {        "year": 2022,        "month": 1,        "day": 1      },      "endTime": {        "hours": 23,        "minutes": 56,        "seconds": 34      }    },    "termsConditions": "https://google.com/privacy",    "url": "https://google.com",    "couponCode": "BOGO-50",    "redeemOnlineUrl": "https://google.com",    "actionType": "book"  },  "userId": "sdfdsfdsfEWEsdfsdsW32dd"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — pathrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "accountIds": \[    "aF3KhyL8JIuBwzK3m7Ly\_iVrVJ2uoXNF0wzcBzgl5\_12554616564525983496"  \],  "summary": "Hello World",  "media": \[    {      "url": "https://i0.wp.com/www.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg",      "caption": "Caption 1",      "type": "video/mp4 or image/png",      "thumbnail": "https://storage.googleapis.com/test/test/media/test.jpeg",      "defaultThumb": "https://storage.googleapis.com/test/test/media/test.jpeg",      "id": "Edf3323fsfsdsd"    }  \],  "status": "draft",  "scheduleDate": "string",  "createdBy": "string",  "followUpComment": "First comment",  "ogTagsDetails": {    "metaImage": "https://wwww.lifeofanarchitect.com/wp-content/uploads/2021/10/architectural-model-making-stairs.jpg",    "metaLink": "string"  },  "type": "post",  "postApprovalDetails": {    "approver": "iVrVJ2uoXNF0wzcBzgl5",    "requesterNote": "Test suggestion",    "approverNote": "Test suggestion",    "approvalStatus": "approved"  },  "scheduleTimeUpdated": true,  "tags": \[    "65f151c99bc2bf3aaf970d72"  \],  "categoryId": "65f151c99bc2bf3aaf970d72",  "tiktokPostDetails": {    "privacyLevel": "PUBLIC\_TO\_EVERYONE",    "promoteOtherBrand": true,    "enableComment": true,    "enableDuet": true,    "enableStitch": true,    "videoDisclosure": true,    "promoteYourBrand": true  },  "gmbPostDetails": {    "gmbEventType": "STANDARD",    "title": "Event Title",    "offerTitle": "Hey",    "startDate": {      "startDate": {        "year": 2022,        "month": 1,        "day": 1      },      "startTime": {        "hours": 23,        "minutes": 56,        "seconds": 34      }    },    "endDate": {      "endDate": {        "year": 2022,        "month": 1,        "day": 1      },      "endTime": {        "hours": 23,        "minutes": 56,        "seconds": 34      }    },    "termsConditions": "https://google.com/privacy",    "url": "https://google.com",    "couponCode": "BOGO-50",    "redeemOnlineUrl": "https://google.com",    "actionType": "book"  },  "userId": "sdfdsfdsfEWEsdfsdsW32dd"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
