# https://marketplace.gohighlevel.com/docs/ghl/proposals/list-documents-contracts-templates

# List templates

GET 

## https://services.leadconnectorhq.com/proposals/templates

List document contract templates for a location

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token``Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Authorization** stringrequired

Access Token

Example: Bearer 9c48df2694a849b6089f9d0d3513efe

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Query Parameters

**locationId** stringrequired

Location Id

Example: jhg64gjhb436fv

**dateFrom** string

Date start from (ISO 8601)

Example: 2025-02-03T18:30:00.000Z

**dateTo** string

Date to (ISO 8601)

Example: 2025-02-14T18:29:59.999Z

**type** string

Comma-separated template types. Valid values: proposal, estimate, contentLibrary

Example: proposal,estimate

**name** string

Template Name

Example: Template Name

**isPublicDocument** boolean

If the docForm is a DocForm

**userId** string

User Id, required when isPublicDocument is true

Example: 1234567890

**limit** string

Limit

Example: 10

**skip** string

Skip

Example: 0

## Responses[​](#responses "Direct link to Responses")

*   200
*   400

Templates fetched successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**data** object\[\]required

Array of templates

*   Array \[
    

**\_id** stringrequired

Template ID

Example:`685d11c371c22e636e9c04b2`

**deleted** booleanrequired

Whether the template is deleted

Example:`false`

**version** numberrequired

Template version

Example:`2`

**name** stringrequired

Template name

Example:`New Template`

**locationId** stringrequired

Location ID

Example:`5rORm9p7RtxWQPzBIbTG`

**type** stringrequired

Template type

**Possible values:** \[`proposal`, `estimate`, `contentLibrary`\]

Example:`proposal`

**updatedBy** stringrequired

User ID who last updated the template

Example:`K9PSPnWjfNoE8DCf5LJZ`

**isPublicDocument** booleanrequired

Whether the template is a public document

Example:`true`

**createdAt** stringrequired

Template creation date

Example:`2025-06-26T09:24:19.305Z`

**updatedAt** stringrequired

Template last update date

Example:`2025-06-26T09:27:32.119Z`

**id** stringrequired

Template ID (alias for \_id)

Example:`685d11c371c22e636e9c04b2`

**documentCount** number

Document count (only present when isPublicDocument is true)

Example:`0`

**docFormUrl** string

Document form URL (only present when isPublicDocument is true)

Example:`https://staging.sendlink.co/documents/doc-form/685d11c371c22e636e9c04b2?locale=en_US`

*   \]
    

**total** numberrequired

Total number of templates

Example:`2`

**traceId** string

Trace ID for request tracking

Example:`d5656876-86a5-46fb-84df-788f1da7937a`

```
{  "data": [    {      "_id": "685d11c371c22e636e9c04b2",      "deleted": false,      "version": 2,      "name": "New Template",      "locationId": "5rORm9p7RtxWQPzBIbTG",      "type": "proposal",      "updatedBy": "K9PSPnWjfNoE8DCf5LJZ",      "isPublicDocument": true,      "createdAt": "2025-06-26T09:24:19.305Z",      "updatedAt": "2025-06-26T09:27:32.119Z",      "id": "685d11c371c22e636e9c04b2",      "documentCount": 0,      "docFormUrl": "https://staging.sendlink.co/documents/doc-form/685d11c371c22e636e9c04b2?locale=en_US"    }  ],  "total": 2,  "traceId": "d5656876-86a5-46fb-84df-788f1da7937a"}
```

Unprocessable Entity

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

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/proposals/documents-and-contracts-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/proposals/templates' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Security Scheme

Location-AccessAgency-Access

Bearer Token

Parameters

locationId — queryrequired

Authorization — headerrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

dateFrom — query

dateTo — query

type — query

name — query

isPublicDocument — query

\---truefalse

userId — query

limit — query

skip — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
