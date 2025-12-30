# https://marketplace.gohighlevel.com/docs/ghl/locations/get-location

# Get Sub-Account (Formerly Location)

GET 

## https://services.leadconnectorhq.com/locations/:locationId

Get details of a Sub-Account (Formerly Location) by passing the sub-account id

### Requirements

#### Scope(s)

`locations.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token``Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Path Parameters

**locationId** stringrequired

Location Id

Example: ve9EPM428h8vShlRW1KT

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

**location** object

**id** string

Example:`ve9EPM428h8vShlRW1KT`

**companyId** string

Example:`5DP4iH6HLkQsiKESj6rh`

**name** string

Example:`dentist`

**domain** string

Example:`test.msgsndr.com`

**address** string

Example:`ganthi nagar, gyanbabu chauk motihati`

**city** string

Example:`motihari`

**state** string

Example:`Loca`

**logoUrl** string

Example:`https://dummyimage.com/o/locationPhotos%2Fve9EPM428h8vShlRW1KT.jpeg`

**country** string

Example:`IN`

**postalCode** string

Example:`567654`

**website** string

Example:`https://gohighlevel.com/`

**timezone** string

Example:`America/Chicago`

**firstName** string

Example:`Dr. Rane`

**lastName** string

Example:`deo`

**email** string

Example:`rane@due.com`

**phone** string

Example:`+919039160788`

**business** object

**name** string

Example:`dentist`

**address** string

Example:`MIG 14, Delhi`

**city** string

Example:`delhi`

**state** string

Example:`delhi`

**country** string

Example:`IN`

**postalCode** string

Example:`567654`

**website** string

Example:`https://gohighlevel.com/`

**timezone** string

Example:`America/Chicago`

**logoUrl** string

Example:`https://dummyimage.com/o/locationPhotos%2Fve9EPM428h8vShlRW1KT.jpeg`

**social** object

**facebookUrl** string

Facebook URL

Example:`https://www.facebook.com/`

**googlePlus** string

Googleplus URL

Example:`https://www.googleplus.com/`

**linkedIn** string

LinkedIn URL

Example:`https://www.linkedIn.com/`

**foursquare** string

Foursquare URL

Example:`https://www.foursquare.com/`

**twitter** string

Twitter URL

Example:`https://www.foutwitterrsquare.com/`

**yelp** string

Yelp URL

Example:`https://www.yelp.com/`

**instagram** string

Instagram URL

Example:`https://www.instagram.com/`

**youtube** string

Instagram URL

Example:`https://www.youtube.com/`

**pinterest** string

Instagram URL

Example:`https://www.pinterest.com/`

**blogRss** string

Instagram URL

Example:`https://www.blogRss.com/`

**googlePlacesId** string

Google Business Places ID

Example:`ChIJJGPdVbQTrjsRGUkefteUeFk`

**settings** object

**allowDuplicateContact** boolean

Example:`false`

**allowDuplicateOpportunity** boolean

Example:`false`

**allowFacebookNameMerge** boolean

Example:`false`

**disableContactTimezone** boolean

Example:`false`

**reseller** object

```
{  "location": {    "id": "ve9EPM428h8vShlRW1KT",    "companyId": "5DP4iH6HLkQsiKESj6rh",    "name": "dentist",    "domain": "test.msgsndr.com",    "address": "ganthi nagar, gyanbabu chauk motihati",    "city": "motihari",    "state": "Loca",    "logoUrl": "https://dummyimage.com/o/locationPhotos%2Fve9EPM428h8vShlRW1KT.jpeg",    "country": "IN",    "postalCode": "567654",    "website": "https://gohighlevel.com/",    "timezone": "America/Chicago",    "firstName": "Dr. Rane",    "lastName": "deo",    "email": "rane@due.com",    "phone": "+919039160788",    "business": {      "name": "dentist",      "address": "MIG 14, Delhi",      "city": "delhi",      "state": "delhi",      "country": "IN",      "postalCode": "567654",      "website": "https://gohighlevel.com/",      "timezone": "America/Chicago",      "logoUrl": "https://dummyimage.com/o/locationPhotos%2Fve9EPM428h8vShlRW1KT.jpeg"    },    "social": {      "facebookUrl": "https://www.facebook.com/",      "googlePlus": "https://www.googleplus.com/",      "linkedIn": "https://www.linkedIn.com/",      "foursquare": "https://www.foursquare.com/",      "twitter": "https://www.foutwitterrsquare.com/",      "yelp": "https://www.yelp.com/",      "instagram": "https://www.instagram.com/",      "youtube": "https://www.youtube.com/",      "pinterest": "https://www.pinterest.com/",      "blogRss": "https://www.blogRss.com/",      "googlePlacesId": "ChIJJGPdVbQTrjsRGUkefteUeFk"    },    "settings": {      "allowDuplicateContact": false,      "allowDuplicateOpportunity": false,      "allowFacebookNameMerge": false,      "disableContactTimezone": false    },    "reseller": {}  }}
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

**name:** [Authorization](/docs/ghl/locations/sub-account-formerly-location-api#authentication)**type:** http**scopes:** `locations.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/locations/:locationId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

locationId — pathrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
