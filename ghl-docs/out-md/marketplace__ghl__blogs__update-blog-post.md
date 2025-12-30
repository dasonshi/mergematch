# https://marketplace.gohighlevel.com/docs/ghl/blogs/update-blog-post

# Update Blog Post

PUT 

## https://services.leadconnectorhq.com/blogs/posts/:postId

The "Update Blog Post" API allows you update blog post for any given blog site. Please use blogs/post-update.write

### Requirements

#### Scope(s)

`blogs/post-update.write`

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

**title** stringrequired

Example:`Your blog title`

**locationId** stringrequired

Example:`Location ID`

**blogId** stringrequired

You can find the blog id from blog site dashboard link

Example:`Blog ID`

**imageUrl** stringrequired

Example:`Image URl`

**description** stringrequired

Example:`A short description`

**rawHTML** stringrequired

Example:`<h1>Your blog content</h1>`

**status** stringrequired

**Possible values:** \[`DRAFT`, `PUBLISHED`, `SCHEDULED`, `ARCHIVED`\]

Example:`PUBLISHED`

**imageAltText** stringrequired

Example:`Alt text for your blog image`

**categories** string\[\]required

This needs to be array of category ids, which you can get from the category get api call.

Example:`["9c48df2694a849b6089f9d0d3513efe","6683abde331c041f32c07aee"]`

**tags** string\[\]

Example:`["blog","seo"]`

**author** stringrequired

This needs to be author id, which you can get from the author get api call.

Example:`6683abde331c041f32c07aea`

**urlSlug** stringrequired

Example:`any-blog-post-url`

**canonicalLink** string

Example:`https://tryghl.blog/post/testing-unsplash`

**publishedAt** stringrequired

Provide ISO timestamp

Example:`2025-02-05T18:30:47.000Z`

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

**updatedBlogPost** objectrequired

Object containing response data of blog post update

**categories** string\[\]required

Array of category IDs associated with the blog post

Example:`["659ecabc4a37969a2b7cc370","6683abde331c041f32c07aee"]`

**tags** string\[\]

Array of tags associated with the blog post

Example:`["Apple","Banana"]`

**archived** booleanrequired

Indicates whether the blog post is archived

Example:`false`

**\_id** stringrequired

Unique identifier of the blog post

Example:`66c381b38be80858b9af62b6`

**title** stringrequired

Title of the blog post

Example:`Banana is good source of energy`

**description** stringrequired

Description of the blog post

Example:`Description`

**imageUrl** stringrequired

URL of the image associated with the blog post

Example:`https://storage.googleapis.com/ghl-test/fACm0Ojm5oC70G3DcFmE/media/66b5aa3b1745b2713a8d033f.jpeg`

**status** stringrequired

Publication status of the blog post

Example:`PUBLISHED`

**imageAltText** stringrequired

Alternative text for the blog post image

Example:`alt`

**urlSlug** stringrequired

URL slug for the blog post

Example:`banana-good-energy`

**canonicalLink** string

Canonical link of the blog post

Example:`https://blog.chatgpts.agency/post/test-8384`

**author** string

Identifier of the author of the blog post

Example:`659ec9634a3796e4e47cc360`

**publishedAt** stringrequired

Timestamp when the blog post was published

Example:`2024-08-19T17:14:57.000Z`

**updatedAt** stringrequired

Timestamp when the blog post was last updated

Example:`2024-08-19T17:32:36.182Z`

```
{  "updatedBlogPost": {    "categories": [      "659ecabc4a37969a2b7cc370",      "6683abde331c041f32c07aee"    ],    "tags": [      "Apple",      "Banana"    ],    "archived": false,    "_id": "66c381b38be80858b9af62b6",    "title": "Banana is good source of energy",    "description": "Description",    "imageUrl": "https://storage.googleapis.com/ghl-test/fACm0Ojm5oC70G3DcFmE/media/66b5aa3b1745b2713a8d033f.jpeg",    "status": "PUBLISHED",    "imageAltText": "alt",    "urlSlug": "banana-good-energy",    "canonicalLink": "https://blog.chatgpts.agency/post/test-8384",    "author": "659ec9634a3796e4e47cc360",    "publishedAt": "2024-08-19T17:14:57.000Z",    "updatedAt": "2024-08-19T17:32:36.182Z"  }}
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

**name:** [Authorization](/docs/ghl/blogs/blogs-api#authentication)**type:** http**scopes:** `blogs/post-update.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PUT 'https://services.leadconnectorhq.com/blogs/posts/:postId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "title": "Your blog title",  "locationId": "Location ID",  "blogId": "Blog ID",  "imageUrl": "Image URl",  "description": "A short description",  "rawHTML": "<h1>Your blog content</h1>",  "status": "PUBLISHED",  "imageAltText": "Alt text for your blog image",  "categories": [    "9c48df2694a849b6089f9d0d3513efe",    "6683abde331c041f32c07aee"  ],  "tags": [    "blog",    "seo"  ],  "author": "6683abde331c041f32c07aea",  "urlSlug": "any-blog-post-url",  "canonicalLink": "https://tryghl.blog/post/testing-unsplash",  "publishedAt": "2025-02-05T18:30:47.000Z"}'
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
  "title": "Your blog title",  "locationId": "Location ID",  "blogId": "Blog ID",  "imageUrl": "Image URl",  "description": "A short description",  "rawHTML": "<h1>Your blog content</h1>",  "status": "PUBLISHED",  "imageAltText": "Alt text for your blog image",  "categories": \[    "9c48df2694a849b6089f9d0d3513efe",    "6683abde331c041f32c07aee"  \],  "tags": \[    "blog",    "seo"  \],  "author": "6683abde331c041f32c07aea",  "urlSlug": "any-blog-post-url",  "canonicalLink": "https://tryghl.blog/post/testing-unsplash",  "publishedAt": "2025-02-05T18:30:47.000Z"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
