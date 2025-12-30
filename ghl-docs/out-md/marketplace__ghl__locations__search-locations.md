# https://marketplace.gohighlevel.com/docs/ghl/locations/search-locations

# Search

GET 

## https://services.leadconnectorhq.com/locations/search

Search Sub-Account (Formerly Location)

### Requirements

#### Scope(s)

`locations.readonly`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Agency Token``Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Query Parameters

**companyId** string

The company/agency id on which you want to perform the search

Example: 5DP4iH6HLkQsiKESj6rh

**skip** string

The value by which the results should be skipped. Default will be 0

Default value:`0`

Example: 1

**limit** string

The value by which the results should be limited. Default will be 10

Default value:`10`

Example: 10

**order** string

The order in which the results should be returned - Allowed values asc, desc. Default will be asc

Default value:`asc`

Example: asc

**email** string

Example: johndoe@mail.com

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
    

**id** string

Location Id

Example:`ve9EPM428h8vShlRW1KT`

**name** string

The name for the sub-account/location

Example:`Mark Shoes`

**phone** string

The phone number of the business for which sub-account is created

Example:`+1410039940`

**email** string

The email for the sub-account/location

Example:`john.doe@mail.com`

**address** string

The address of the business for which sub-account is created

Example:`4th fleet street`

**city** string

The city where the business is located for which sub-account is created

Example:`New York`

**state** string

The state in which the business operates for which sub-account is created

Example:`Illinois`

**country** string

The country in which the business is present for which sub-account is created

Example:`US`

**postalCode** string

The postal code of the business for which sub-account is created

Example:`567654`

**website** string

The website of the business for which sub-account is created

Example:`https://yourwebsite.com`

**timezone** string

The timezone of the business for which sub-account is created

Example:`US/Central`

**settings** object

The default settings for location

**allowDuplicateContact** boolean

Example:`false`

**allowDuplicateOpportunity** boolean

Example:`false`

**allowFacebookNameMerge** boolean

Example:`false`

**disableContactTimezone** boolean

Example:`false`

**social** object

The social media links for location

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

*   \]
    

```
{  "locations": [    {      "id": "ve9EPM428h8vShlRW1KT",      "name": "Mark Shoes",      "phone": "+1410039940",      "email": "john.doe@mail.com",      "address": "4th fleet street",      "city": "New York",      "state": "Illinois",      "country": "US",      "postalCode": "567654",      "website": "https://yourwebsite.com",      "timezone": "US/Central",      "settings": {        "allowDuplicateContact": false,        "allowDuplicateOpportunity": false,        "allowFacebookNameMerge": false,        "disableContactTimezone": false      },      "social": {        "facebookUrl": "https://www.facebook.com/",        "googlePlus": "https://www.googleplus.com/",        "linkedIn": "https://www.linkedIn.com/",        "foursquare": "https://www.foursquare.com/",        "twitter": "https://www.foutwitterrsquare.com/",        "yelp": "https://www.yelp.com/",        "instagram": "https://www.instagram.com/",        "youtube": "https://www.youtube.com/",        "pinterest": "https://www.pinterest.com/",        "blogRss": "https://www.blogRss.com/",        "googlePlacesId": "ChIJJGPdVbQTrjsRGUkefteUeFk"      }    }  ]}
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

**name:** [Authorization](/docs/ghl/locations/sub-account-formerly-location-api#authentication)**type:** http**scopes:** `locations.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Agency (OR) Private Integration Token of Agency.

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
curl -L 'https://services.leadconnectorhq.com/locations/search' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Security Scheme

Agency-AccessLocation-Access

Bearer Token

Parameters

Version — headerrequired

\---2021-07-28

Show optional parameters

companyId — query

skip — query

limit — query

order — query

email — query

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
