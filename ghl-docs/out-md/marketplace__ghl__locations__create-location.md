# https://marketplace.gohighlevel.com/docs/ghl/locations/create-location

# Create Sub-Account (Formerly Location)

POST 

## https://services.leadconnectorhq.com/locations/

Create a new Sub-Account (Formerly Location) based on the data provided

info

This feature is only available on Agency Pro ($497) plan.

### Requirements

#### Scope(s)

`locations.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Agency Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

*   application/json

### Body**required**

**name** stringrequired

The name for the sub-account/location

Example:`Mark Shoes`

**phone** string

The phone number of the business for which sub-account is created with the appropriate country-code

Example:`+1410039940`

**companyId** stringrequired

Company/Agency Id

Example:`UAXssdawIWAWD`

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

The 2 letter country-code in which the business is present for which sub-account is created

**Possible values:** \[`AF`, `AX`, `AL`, `DZ`, `AS`, `AD`, `AO`, `AI`, `AQ`, `AG`, `AR`, `AM`, `AW`, `AU`, `AT`, `AZ`, `BS`, `BH`, `BD`, `BB`, `BY`, `BE`, `BZ`, `BJ`, `BM`, `BT`, `BO`, `BA`, `BW`, `BV`, `BR`, `IO`, `BN`, `BG`, `BF`, `BI`, `KH`, `CM`, `CA`, `CV`, `KY`, `CF`, `TD`, `CL`, `CN`, `CX`, `CC`, `CO`, `KM`, `CG`, `CD`, `CK`, `CR`, `CI`, `HR`, `CU`, `CY`, `CZ`, `DK`, `DJ`, `DM`, `DO`, `EC`, `EG`, `SV`, `GQ`, `ER`, `EE`, `ET`, `FK`, `FO`, `FJ`, `FI`, `FR`, `GF`, `PF`, `TF`, `GA`, `GM`, `GE`, `DE`, `GH`, `GI`, `GR`, `GL`, `GD`, `GP`, `GU`, `GT`, `GG`, `GN`, `GW`, `GY`, `HT`, `HM`, `VA`, `HN`, `HK`, `HU`, `IS`, `IN`, `ID`, `IR`, `IQ`, `IE`, `IM`, `IL`, `IT`, `JM`, `JP`, `JE`, `JO`, `KZ`, `KE`, `KI`, `KP`, `KR`, `XK`, `KW`, `KG`, `LA`, `LV`, `LB`, `LS`, `LR`, `LY`, `LI`, `LT`, `LU`, `MO`, `MK`, `MG`, `MW`, `MY`, `MV`, `ML`, `MT`, `MH`, `MQ`, `MR`, `MU`, `YT`, `MX`, `FM`, `MD`, `MC`, `MN`, `ME`, `MS`, `MA`, `MZ`, `MM`, `NA`, `NR`, `NP`, `NL`, `AN`, `NC`, `NZ`, `NI`, `NE`, `NG`, `NU`, `NF`, `MP`, `NO`, `OM`, `PK`, `PW`, `PS`, `PA`, `PG`, `PY`, `PE`, `PH`, `PN`, `PL`, `PT`, `PR`, `QA`, `RE`, `RO`, `RU`, `RW`, `SH`, `KN`, `LC`, `MF`, `PM`, `VC`, `WS`, `SM`, `ST`, `SA`, `SN`, `RS`, `SC`, `SL`, `SG`, `SX`, `SK`, `SI`, `SB`, `SO`, `ZA`, `GS`, `ES`, `LK`, `SD`, `SR`, `SJ`, `SZ`, `SE`, `CH`, `SY`, `TW`, `TJ`, `TZ`, `TH`, `TL`, `TG`, `TK`, `TO`, `TT`, `TN`, `TR`, `TM`, `TC`, `TV`, `UG`, `GB`, `UA`, `AE`, `US`, `UM`, `UY`, `UZ`, `VU`, `VE`, `VN`, `VG`, `VI`, `WF`, `EH`, `YE`, `ZM`, `ZW`\]

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

**prospectInfo** object

**firstName** stringrequired

First name of the prospect

Example:`John`

**lastName** stringrequired

Last name of the prospect

Example:`Doe`

**email** stringrequired

Email of the prospect

Example:`john.doe@mail.com`

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

**twilio** object

The twilio credentials for location

**sid** stringrequired

SID provided by Twilio

Example:`AC_XXXXXXXXXXX`

**authToken** stringrequired

Auth token provided by Twilio

Example:`77_XXXXXXXXXXX`

**mailgun** object

The mailgun credentials for location

**apiKey** stringrequired

API key provided by Mailgun

Example:`key-XXXXXXXXXXX`

**domain** stringrequired

Domain connected with Mailgun

Example:`replies.yourdomain.com`

**snapshotId** string

The snapshot ID to be loaded into the location.

Example:`XXXXXXXXXXX`

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**id** string

Location Id

Example:`ve9EPM428h8vShlRW1KT`

**companyId** string

Company/Agency Id

Example:`UAXssdawIWAWD`

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

**domain** string

Example:`test.msgsndr.com`

**country** string

The country in which the business is present for which sub-account is created

**Possible values:** \[`AF`, `AX`, `AL`, `DZ`, `AS`, `AD`, `AO`, `AI`, `AQ`, `AG`, `AR`, `AM`, `AW`, `AU`, `AT`, `AZ`, `BS`, `BH`, `BD`, `BB`, `BY`, `BE`, `BZ`, `BJ`, `BM`, `BT`, `BO`, `BA`, `BW`, `BV`, `BR`, `IO`, `BN`, `BG`, `BF`, `BI`, `KH`, `CM`, `CA`, `CV`, `KY`, `CF`, `TD`, `CL`, `CN`, `CX`, `CC`, `CO`, `KM`, `CG`, `CD`, `CK`, `CR`, `CI`, `HR`, `CU`, `CY`, `CZ`, `DK`, `DJ`, `DM`, `DO`, `EC`, `EG`, `SV`, `GQ`, `ER`, `EE`, `ET`, `FK`, `FO`, `FJ`, `FI`, `FR`, `GF`, `PF`, `TF`, `GA`, `GM`, `GE`, `DE`, `GH`, `GI`, `GR`, `GL`, `GD`, `GP`, `GU`, `GT`, `GG`, `GN`, `GW`, `GY`, `HT`, `HM`, `VA`, `HN`, `HK`, `HU`, `IS`, `IN`, `ID`, `IR`, `IQ`, `IE`, `IM`, `IL`, `IT`, `JM`, `JP`, `JE`, `JO`, `KZ`, `KE`, `KI`, `KP`, `KR`, `XK`, `KW`, `KG`, `LA`, `LV`, `LB`, `LS`, `LR`, `LY`, `LI`, `LT`, `LU`, `MO`, `MK`, `MG`, `MW`, `MY`, `MV`, `ML`, `MT`, `MH`, `MQ`, `MR`, `MU`, `YT`, `MX`, `FM`, `MD`, `MC`, `MN`, `ME`, `MS`, `MA`, `MZ`, `MM`, `NA`, `NR`, `NP`, `NL`, `AN`, `NC`, `NZ`, `NI`, `NE`, `NG`, `NU`, `NF`, `MP`, `NO`, `OM`, `PK`, `PW`, `PS`, `PA`, `PG`, `PY`, `PE`, `PH`, `PN`, `PL`, `PT`, `PR`, `QA`, `RE`, `RO`, `RU`, `RW`, `SH`, `KN`, `LC`, `MF`, `PM`, `VC`, `WS`, `SM`, `ST`, `SA`, `SN`, `RS`, `SC`, `SL`, `SG`, `SX`, `SK`, `SI`, `SB`, `SO`, `ZA`, `GS`, `ES`, `LK`, `SD`, `SR`, `SJ`, `SZ`, `SE`, `CH`, `SY`, `TW`, `TJ`, `TZ`, `TH`, `TL`, `TG`, `TK`, `TO`, `TT`, `TN`, `TR`, `TM`, `TC`, `TV`, `UG`, `GB`, `UA`, `AE`, `US`, `UM`, `UY`, `UZ`, `VU`, `VE`, `VN`, `VG`, `VI`, `WF`, `EH`, `YE`, `ZM`, `ZW`\]

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

```
{  "id": "ve9EPM428h8vShlRW1KT",  "companyId": "UAXssdawIWAWD",  "name": "Mark Shoes",  "phone": "+1410039940",  "email": "john.doe@mail.com",  "address": "4th fleet street",  "city": "New York",  "state": "Illinois",  "domain": "test.msgsndr.com",  "country": "US",  "postalCode": "567654",  "website": "https://yourwebsite.com",  "timezone": "US/Central",  "settings": {    "allowDuplicateContact": false,    "allowDuplicateOpportunity": false,    "allowFacebookNameMerge": false,    "disableContactTimezone": false  },  "social": {    "facebookUrl": "https://www.facebook.com/",    "googlePlus": "https://www.googleplus.com/",    "linkedIn": "https://www.linkedIn.com/",    "foursquare": "https://www.foursquare.com/",    "twitter": "https://www.foutwitterrsquare.com/",    "yelp": "https://www.yelp.com/",    "instagram": "https://www.instagram.com/",    "youtube": "https://www.youtube.com/",    "pinterest": "https://www.pinterest.com/",    "blogRss": "https://www.blogRss.com/",    "googlePlacesId": "ChIJJGPdVbQTrjsRGUkefteUeFk"  }}
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

**name:** [Authorization](/docs/ghl/locations/sub-account-formerly-location-api#authentication)**type:** http**scopes:** `locations.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Agency (OR) Private Integration Token of Agency.

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
curl -L 'https://services.leadconnectorhq.com/locations/' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "name": "Mark Shoes",  "phone": "+1410039940",  "companyId": "UAXssdawIWAWD",  "address": "4th fleet street",  "city": "New York",  "state": "Illinois",  "country": "US",  "postalCode": "567654",  "website": "https://yourwebsite.com",  "timezone": "US/Central",  "prospectInfo": {    "firstName": "John",    "lastName": "Doe",    "email": "john.doe@mail.com"  },  "settings": {    "allowDuplicateContact": false,    "allowDuplicateOpportunity": false,    "allowFacebookNameMerge": false,    "disableContactTimezone": false  },  "social": {    "facebookUrl": "https://www.facebook.com/",    "googlePlus": "https://www.googleplus.com/",    "linkedIn": "https://www.linkedIn.com/",    "foursquare": "https://www.foursquare.com/",    "twitter": "https://www.foutwitterrsquare.com/",    "yelp": "https://www.yelp.com/",    "instagram": "https://www.instagram.com/",    "youtube": "https://www.youtube.com/",    "pinterest": "https://www.pinterest.com/",    "blogRss": "https://www.blogRss.com/",    "googlePlacesId": "ChIJJGPdVbQTrjsRGUkefteUeFk"  },  "twilio": {    "sid": "AC_XXXXXXXXXXX",    "authToken": "77_XXXXXXXXXXX"  },  "mailgun": {    "apiKey": "key-XXXXXXXXXXX",    "domain": "replies.yourdomain.com"  },  "snapshotId": "XXXXXXXXXXX"}'
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
  "name": "Mark Shoes",  "phone": "+1410039940",  "companyId": "UAXssdawIWAWD",  "address": "4th fleet street",  "city": "New York",  "state": "Illinois",  "country": "US",  "postalCode": "567654",  "website": "https://yourwebsite.com",  "timezone": "US/Central",  "prospectInfo": {    "firstName": "John",    "lastName": "Doe",    "email": "john.doe@mail.com"  },  "settings": {    "allowDuplicateContact": false,    "allowDuplicateOpportunity": false,    "allowFacebookNameMerge": false,    "disableContactTimezone": false  },  "social": {    "facebookUrl": "https://www.facebook.com/",    "googlePlus": "https://www.googleplus.com/",    "linkedIn": "https://www.linkedIn.com/",    "foursquare": "https://www.foursquare.com/",    "twitter": "https://www.foutwitterrsquare.com/",    "yelp": "https://www.yelp.com/",    "instagram": "https://www.instagram.com/",    "youtube": "https://www.youtube.com/",    "pinterest": "https://www.pinterest.com/",    "blogRss": "https://www.blogRss.com/",    "googlePlacesId": "ChIJJGPdVbQTrjsRGUkefteUeFk"  },  "twilio": {    "sid": "AC\_XXXXXXXXXXX",    "authToken": "77\_XXXXXXXXXXX"  },  "mailgun": {    "apiKey": "key-XXXXXXXXXXX",    "domain": "replies.yourdomain.com"  },  "snapshotId": "XXXXXXXXXXX"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
