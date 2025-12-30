# https://marketplace.gohighlevel.com/docs/ghl/invoices/list-estimates

# List Estimates

GET 

## https://services.leadconnectorhq.com/invoices/estimate/list

Get a paginated list of estimates

### Requirements

#### Scope(s)

`invoices/estimate.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token``Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Query Parameters

**altId** stringrequired

Location Id or Agency Id

Example: 6578278e879ad2646715ba9c

**altType** stringrequired

**Possible values:** \[`location`\]

**startAt** string

startAt in YYYY-MM-DD format

Example: 2023-01-01

**endAt** string

endAt in YYYY-MM-DD format

Example: 2023-01-01

**search** string

search text for estimates name

Example: Home services estimate

**status** string

**Possible values:** \[`all`, `draft`, `sent`, `accepted`, `declined`, `invoiced`, `viewed`\]

estimate status

Example: sent

**contactId** string

Contact ID for the estimate

Example: AmuzcoPBpgKeccNsFlib

**limit** stringrequired

Limit the number of items to return

Example: 10

**offset** stringrequired

Number of items to skip

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

**estimates** string\[\]required

List of estimates

**total** numberrequired

Total number of estimates

**traceId** stringrequired

Unique identifier for tracing the request

```
{  "estimates": [    "string"  ],  "total": 0,  "traceId": "string"}
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

**name:** [Authorization](/docs/ghl/invoices/invoice-api#authentication)**type:** http**scopes:** `invoices/estimate.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/invoices/estimate/list' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

altId — queryrequired

altType — queryrequired

\---location

limit — queryrequired

offset — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

startAt — query

endAt — query

search — query

status — query

\---alldraftsentaccepteddeclinedinvoicedviewed

contactId — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
