# https://marketplace.gohighlevel.com/docs/ghl/blogs/get-blogs

# Get Blogs by Location ID

GET 

## https://services.leadconnectorhq.com/blogs/site/all

The "Get Blogs by Location ID" API allows you get blogs using Location ID.Please use blogs/list.readonly

### Requirements

#### Scope(s)

`blogs/list.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Query Parameters

**locationId** stringrequired

Example: ve9EPM428h8vShlRW1KT

**skip** numberrequired

Example: 0

**limit** numberrequired

Example: 4

**searchTerm** string

search for any post by name

Example: ai news

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

**data** object\[\]required

Object containing response data of blog

*   Array \[
    

**\_id** stringrequired

Unique identifier of the blog

Example:`lMOzIQZne5m6zQ528sT6`

**name** stringrequired

Name of the blog

Example:`My blog`

*   \]
    

```
{  "data": [    {      "_id": "lMOzIQZne5m6zQ528sT6",      "name": "My blog"    }  ]}
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

**name:** [Authorization](/docs/ghl/blogs/blogs-api#authentication)**type:** http**scopes:** `blogs/list.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/blogs/site/all' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — queryrequired

skip — queryrequired

limit — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

searchTerm — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
