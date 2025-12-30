# https://marketplace.gohighlevel.com/docs/ghl/objects/search-object-records

# Search Object Records

POST 

## https://services.leadconnectorhq.com/objects/:schemaKey/records/search

Supported Objects are custom objects and standard objects like "business". Documentation Link - [https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0/87cpx-379336](https://doc.clickup.com/8631005/d/h/87cpx-277156/93bf0c2e23177b0/87cpx-379336)

### Requirements

#### Scope(s)

`objects/record.readonly`

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

**schemaKey** string

custom object key

Example: 632c34b4c9b7da3358ac9891

*   application/json

### Body**required**

**locationId** stringrequired

Location Id

Example:`ve9EPM428h8vShlRW1KT`

**page** numberrequired

Page

Example:`1`

**pageLimit** numberrequired

Page Limit

Example:`10`

**query** stringrequired

Pass this query parameter to search using your searchable properties. For example, if you have a custom object called “Pets” and have configured “name” as a searchable property, you can pass name:Buddy to search for pets with the name “Buddy.”

Example:`Buddy`

**searchAfter** string\[\]required

Example:`["sx6wyHhbFdRXh302Lunr","sx6wyHhbFdRXh302Lunr"]`

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**records** object\[\]

Records

*   Array \[
    

**id** stringrequired

id of the record

Example:`661c06b4ffde146bdb469442`

**owner** string\[\]required

Owner (User's id). Limited to 1 for now . Only supported for custom objects for now

Example:`["sx6wyHhbFdRXh302Lunr"]`

**followers** string\[\]required

Follower (User's ids). Limited to 10 and supported for custom objects for now

Example:`["sx6wyHhbFdRXh302Lunr","v5cEPM428h8vShlRW1KT"]`

**properties** stringrequired

Properties of the record

Example:`{"customer_number":1424,"ticket_name":"Customer not able login","phone_number":"+917000000000","money":{"currency":"default","value":100},"type_of_ticket":"doubt","section_of_app":["contacts","smartlist"],"recieved_on":"2024-07-11","my_files":[{"url":"---url_of_file---"}],"my_textbox_list.option_a":"Value 1","my_textbox_list.option_b":"Value 2"}`

**createdAt** date-timerequired

Date and time when the object was added

**updatedAt** date-timerequired

Date and time when the object was last updated

**locationId** stringrequired

Location Id

Example:`ve9EPM428h8vShlRW1KT`

**objectId** stringrequired

ObjectId Id

Example:`6d6f6e676f5f6576656e7473`

**objectKey** stringrequired

ObjectId key

Example:`custom_objects.pet`

**createdBy** object

Created By Meta

**channel** stringrequired

Creation Channel

Example:`WEB_USER`

**createdAt** stringrequired

Created At

Example:`2025-01-02T09:35:39.032Z`

**source** stringrequired

From where the record was created

Example:`PUBLIC_API`

**sourceId** stringrequired

User/Resource Id

Example:`26653146-ec82-435d-8a99-84ecdb7fde13`

**lastUpdatedBy** object

Last Updated By Meta

**channel** stringrequired

Creation Channel

Example:`WEB_USER`

**createdAt** stringrequired

Created At

Example:`2025-01-02T09:35:39.032Z`

**source** stringrequired

From where the record was created

Example:`PUBLIC_API`

**sourceId** stringrequired

User/Resource Id

Example:`26653146-ec82-435d-8a99-84ecdb7fde13`

**searchAfter** number\[\]required

Example:`[1738683828372,"67a235b49b289431bcf657f8"]`

*   \]
    

**total** numberrequired

Total Number of records

Example:`20`

```
{  "records": [    {      "id": "661c06b4ffde146bdb469442",      "owner": [        "sx6wyHhbFdRXh302Lunr"      ],      "followers": [        "sx6wyHhbFdRXh302Lunr",        "v5cEPM428h8vShlRW1KT"      ],      "properties": {        "customer_number": 1424,        "ticket_name": "Customer not able login",        "phone_number": "+917000000000",        "money": {          "currency": "default",          "value": 100        },        "type_of_ticket": "doubt",        "section_of_app": [          "contacts",          "smartlist"        ],        "recieved_on": "2024-07-11",        "my_files": [          {            "url": "---url_of_file---"          }        ],        "my_textbox_list.option_a": "Value 1",        "my_textbox_list.option_b": "Value 2"      },      "createdAt": "2024-07-29T15:51:28.071Z",      "updatedAt": "2024-07-29T15:51:28.071Z",      "locationId": "ve9EPM428h8vShlRW1KT",      "objectId": "6d6f6e676f5f6576656e7473",      "objectKey": "custom_objects.pet",      "createdBy": {        "channel": "WEB_USER",        "createdAt": "2025-01-02T09:35:39.032Z",        "source": "PUBLIC_API",        "sourceId": "26653146-ec82-435d-8a99-84ecdb7fde13"      },      "lastUpdatedBy": {        "channel": "WEB_USER",        "createdAt": "2025-01-02T09:35:39.032Z",        "source": "PUBLIC_API",        "sourceId": "26653146-ec82-435d-8a99-84ecdb7fde13"      },      "searchAfter": [        1738683828372,        "67a235b49b289431bcf657f8"      ]    }  ],  "total": 20}
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

**name:** [Authorization](/docs/ghl/objects/custom-objects-api#authentication)**type:** http**scopes:** `objects/record.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/objects/:schemaKey/records/search' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "locationId": "ve9EPM428h8vShlRW1KT",  "page": 1,  "pageLimit": 10,  "query": "Buddy",  "searchAfter": [    "sx6wyHhbFdRXh302Lunr",    "sx6wyHhbFdRXh302Lunr"  ]}'
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

Show optional parameters

schemaKey — path

Body required

{
  "locationId": "ve9EPM428h8vShlRW1KT",  "page": 1,  "pageLimit": 10,  "query": "Buddy",  "searchAfter": \[    "sx6wyHhbFdRXh302Lunr",    "sx6wyHhbFdRXh302Lunr"  \]
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
