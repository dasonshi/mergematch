# https://marketplace.gohighlevel.com/docs/ghl/contacts/get-contacts

# Get Contacts

GET 

## https://services.leadconnectorhq.com/contacts/

deprecated

This endpoint has been deprecated and may be replaced or removed in future versions of the API.

Get Contacts

**Note:** This API endpoint is deprecated. Please use the [Search Contacts](https://highlevel.stoplight.io/docs/integrations/dbe4f3a00a106-search-contacts) endpoint instead.

### Requirements

#### Scope(s)

`contacts.readonly`

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

Location Id

Example: ve9EPM428h8vShlRW1KT

**startAfterId** string

Start After Id

Example: UIaE1WjAwWKdlyD7osQI

**startAfter** number

Start Afte

Example: 1603870249758

**query** string

Contact Query

Example: John

**limit** number

Limit Per Page records count. will allow maximum up to 100 and default will be 20

Default value:`20`

Example: 20

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

**contacts** object\[\]

*   Array \[
    

**id** string

Example:`ocQHyuzHvysMo5N5VsXc`

**locationId** string

Example:`C2QujeCh8ZnC7al2InWR`

**email** string

Example:`JohnDeo@gmail.com`

**timezone** string

Example:`Asia/Calcutta`

**country** string

Example:`DE`

**source** string

Example:`xyz form`

**dateAdded** string

Example:`2020-10-29T09:31:30.255Z`

**customFields** object\[\]

*   Array \[
    

**id** string

Example:`MgobCB14YMVKuE4Ka8p1`

**value** string

Example:`name`

*   \]
    

**tags** string\[\]

Example:`["nisi sint commodo amet","consequat"]`

**businessId** string

Example:`641c094001436dbc2081e642`

**attributions** object\[\]

*   Array \[
    

**url** stringrequired

Example:`Trigger Link`

**campaign** stringnullable

**utmSource** stringnullable

**utmMedium** stringnullable

**utmContent** stringnullable

**referrer** stringnullable

Example:`https: //www.google.com`

**campaignId** stringnullable

**fbclid** stringnullable

**gclid** stringnullable

Example:`CjOKCQjwnNyUBhCZARISAI9AYIFtNnIcWcYGIOQINz_ZoFI5SSLRRugSoPZoiEu27IZBY£1-MAIWmEaAo2VEALW_WCB`

**msclikid** stringnullable

**dclid** stringnullable

**fbc** stringnullable

**fbp** stringnullable

Example:`fb. 1.1674748390986.1171287961`

**fbEventId** stringnullable

Example:`Mozilla/5.0`

**userAgent** stringnullable

Example:`Mozilla/5.0`

**ip** stringnullable

Example:`58.111.106.198`

**medium** stringnullable

Example:`survey`

**mediumId** stringnullable

Example:`FglfHAn30PRwsZVyQlKp`

*   \]
    

**followers** string\[\]

Example:`641c094001436dbc2081e642`

*   \]
    

**count** number

Example:`10`

```
{  "contacts": [    {      "id": "ocQHyuzHvysMo5N5VsXc",      "locationId": "C2QujeCh8ZnC7al2InWR",      "email": "JohnDeo@gmail.com",      "timezone": "Asia/Calcutta",      "country": "DE",      "source": "xyz form",      "dateAdded": "2020-10-29T09:31:30.255Z",      "customFields": [        {          "id": "MgobCB14YMVKuE4Ka8p1",          "value": "name"        }      ],      "tags": [        "nisi sint commodo amet",        "consequat"      ],      "businessId": "641c094001436dbc2081e642",      "attributions": [        {          "url": "Trigger Link",          "campaign": "string",          "utmSource": "string",          "utmMedium": "string",          "utmContent": "string",          "referrer": "https: //www.google.com",          "campaignId": "string",          "fbclid": "string",          "gclid": "CjOKCQjwnNyUBhCZARISAI9AYIFtNnIcWcYGIOQINz_ZoFI5SSLRRugSoPZoiEu27IZBY£1-MAIWmEaAo2VEALW_WCB",          "msclikid": "string",          "dclid": "string",          "fbc": "string",          "fbp": "fb. 1.1674748390986.1171287961",          "fbEventId": "Mozilla/5.0",          "userAgent": "Mozilla/5.0",          "ip": "58.111.106.198",          "medium": "survey",          "mediumId": "FglfHAn30PRwsZVyQlKp"        }      ],      "followers": "641c094001436dbc2081e642"    }  ],  "count": 10}
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

**name:** [Authorization](/docs/ghl/contacts/contacts-api#authentication)**type:** http**scopes:** `contacts.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/contacts/' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

startAfterId — query

startAfter — query

query — query

limit — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
