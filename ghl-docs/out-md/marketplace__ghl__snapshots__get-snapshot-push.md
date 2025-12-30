# https://marketplace.gohighlevel.com/docs/ghl/snapshots/get-snapshot-push

# Get Snapshot Push between Dates

GET 

## https://services.leadconnectorhq.com/snapshots/snapshot-status/:snapshotId

Get list of sub-accounts snapshot pushed in time period

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Path Parameters

**snapshotId** stringrequired

Example: 39It2BFz7EkNaNBALPif

### Query Parameters

**companyId** stringrequired

Example: 5D112kQsiKESj6rash

**from** stringrequired

Example: 10-10-2022 12:00 AM

**to** stringrequired

Example: 12-18-2023 11:59 PM

**lastDoc** stringrequired

Id for last document till what you want to skip

Example: VUJO4Sw2TrDNZ5lx4wZg

**limit** stringrequired

Example: 10

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**data** object\[\]

*   Array \[
    

**id** string

Document id

Example:`1eM2UgkfaECOYyUdCo9Pa`

**locationId** string

Sub-account id

Example:`BrKClvyvdxhJ9Mxz2pzQ`

**status** string

Status of snapshot push

Example:`processing`

**dateAdded** date-time

Timestamp of when snapshot processing starts for sub-account

Example:`10/28/2022, 6:24:54 PM`

*   \]
    

```
{  "data": [    {      "id": "1eM2UgkfaECOYyUdCo9Pa",      "locationId": "BrKClvyvdxhJ9Mxz2pzQ",      "status": "processing",      "dateAdded": "10/28/2022, 6:24:54 PM"    }  ]}
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

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/snapshots/snapshots-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Agency (OR) Personal Integration Token from Agency.

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
curl -L 'https://services.leadconnectorhq.com/snapshots/snapshot-status/:snapshotId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

snapshotId — pathrequired

companyId — queryrequired

from — queryrequired

to — queryrequired

lastDoc — queryrequired

limit — queryrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
