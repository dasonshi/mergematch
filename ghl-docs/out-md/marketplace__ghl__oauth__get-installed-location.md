# https://marketplace.gohighlevel.com/docs/ghl/oauth/get-installed-location

# Get Location where app is installed

GET 

## https://services.leadconnectorhq.com/oauth/installedLocations

This API allows you fetch location where app is installed upon

### Requirements

#### Scope(s)

`oauth.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Query Parameters

**skip** string

Parameter to skip the number installed locations

Default value:`0`

Example: 1

**limit** string

Parameter to limit the number installed locations

Default value:`20`

Example: 10

**query** string

Parameter to search for the installed location by name

Example: location name

**isInstalled** boolean

Filters out location which are installed for specified app under the specified company

Example:

**companyId** stringrequired

Parameter to search by the companyId

Example: tDtDnQdgm2LXpyiqYvZ6

**appId** stringrequired

Parameter to search by the appId

Example: tDtDnQdgm2LXpyiqYvZ6

**versionId** string

VersionId of the app

Example: tDtDnQdgm2LXpyiqYvZ6

**onTrial** boolean

Filters out locations which are installed for specified app in trial mode

Example:

**planId** string

Filters out location which are installed for specified app under the specified planId

Example:

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

**locations** object\[\]

*   Array \[
    

**\_id** stringrequired

Location ID

Example:`0IHuJvc2ofPAAA8GzTRi`

**name** stringrequired

Name of the location

Example:`John Deo`

**address** stringrequired

Address linked to location

Example:`47 W 13th St, New York, NY 10011, USA`

**isInstalled** boolean

Check if the requested app is installed for following location

Example:`true`

*   \]
    

**count** number

Total location count under the company

Example:`1231`

**installToFutureLocations** boolean

Boolean to control if user wants app to be automatically installed to future locations

Example:`true`

```
{  "locations": [    {      "_id": "0IHuJvc2ofPAAA8GzTRi",      "name": "John Deo",      "address": "47 W 13th St, New York, NY 10011, USA",      "isInstalled": true    }  ],  "count": 1231,  "installToFutureLocations": true}
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

**name:** [Authorization](/docs/ghl/oauth/oauth-2-0#authentication)**type:** http**scopes:** `oauth.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Agency (OR) Private Integration Token of Agency.

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
curl -L 'https://services.leadconnectorhq.com/oauth/installedLocations' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

companyId — queryrequired

appId — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

skip — query

limit — query

query — query

isInstalled — query

\---truefalse

versionId — query

onTrial — query

\---truefalse

planId — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
