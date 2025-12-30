# https://marketplace.gohighlevel.com/docs/ghl/objects/get-record-by-id

# Get Record By Id

GET 

## https://services.leadconnectorhq.com/objects/:schemaKey/records/:id

Allows you to get a Standard Object like business and custom object record by Id

### Requirements

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Path Parameters

**schemaKey** stringrequired

The key of the Custom Object / Standard Object Schema. For custom objects, the key must include the “custom\_objects.” prefix, while standard objects use their respective object keys. This information is available on the Custom Objects Details page under Settings.

Example: custom\_objects.pet or business.email (for company's email)

**id** stringrequired

id of the record to be updated. Available on the Record details page under the 3 dots or in the url

Example: 632c34b4c9b7da3358ac9891

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**record** object

**id** stringrequired

id of the record

Example:`661c06b4ffde146bdb469442`

**owner** string\[\]required

Owner (User's id). Limited to 1 for now. Only Supported with custom objects

Example:`["sx6wyHhbFdRXh302Lunr"]`

**followers** string\[\]required

Follower (User's ids). Limited to 10 for now

Example:`["sx6wyHhbFdRXh302Lunr","v5cEPM428h8vShlRW1KT"]`

**properties** stringrequired

Properties of the record

Example:`{"customer_number":1424,"ticket_name":"Customer not able login","phone_number":"+917000000000","money":{"currency":"default","value":100},"type_of_ticket":"doubt","section_of_app":["contacts","smartlist"],"recieved_on":"2024-07-11","my_files":[{"url":"---url_of_file---"}],"my_textbox_list.option_a":"Value 1","my_textbox_list.option_b":"Value 2"}`

**dateAdded** date-timerequired

Date and time when the object was added

**dateUpdated** date-timerequired

Date and time when the object was last updated

```
{  "record": {    "id": "661c06b4ffde146bdb469442",    "owner": [      "sx6wyHhbFdRXh302Lunr"    ],    "followers": [      "sx6wyHhbFdRXh302Lunr",      "v5cEPM428h8vShlRW1KT"    ],    "properties": {      "customer_number": 1424,      "ticket_name": "Customer not able login",      "phone_number": "+917000000000",      "money": {        "currency": "default",        "value": 100      },      "type_of_ticket": "doubt",      "section_of_app": [        "contacts",        "smartlist"      ],      "recieved_on": "2024-07-11",      "my_files": [        {          "url": "---url_of_file---"        }      ],      "my_textbox_list.option_a": "Value 1",      "my_textbox_list.option_b": "Value 2"    },    "dateAdded": "2024-07-29T15:51:28.071Z",    "dateUpdated": "2024-07-29T15:51:28.071Z"  }}
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

**name:** [Authorization](/docs/ghl/objects/custom-objects-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/objects/:schemaKey/records/:id' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

schemaKey — pathrequired

id — pathrequired

Version — headerrequired

\---2021-07-28

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
