# https://marketplace.gohighlevel.com/docs/ghl/locations/update-custom-value

# Update Custom Value

PUT 

## https://services.leadconnectorhq.com/locations/:locationId/customValues/:id

Update Custom Value

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

**locationId** stringrequired

Location Id

Example: ve9EPM428h8vShlRW1KT

**id** stringrequired

Custom Value Id

Example: kOBjMVAJhFuUeYIojVet

*   application/json

### Body**required**

**name** stringrequired

Example:`Custom Field Name`

**value** stringrequired

Example:`Value`

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

**customValue** object

**id** string

Example:`rWQ709Pb62syqGLceg1x`

**name** string

Example:`Custom Field`

**fieldKey** string

Example:`{{ custom_values.custom_field }}`

**value** string

Example:`Value`

**locationId** string

Example:`rWQ709Pb6dasyqGLceg1x`

```
{  "customValue": {    "id": "rWQ709Pb62syqGLceg1x",    "name": "Custom Field",    "fieldKey": "{{ custom_values.custom_field }}",    "value": "Value",    "locationId": "rWQ709Pb6dasyqGLceg1x"  }}
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

**name:** [Authorization](/docs/ghl/locations/sub-account-formerly-location-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PUT 'https://services.leadconnectorhq.com/locations/:locationId/customValues/:id' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "name": "Custom Field Name",  "value": "Value"}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

locationId — pathrequired

id — pathrequired

Version — headerrequired

\---2021-07-28

Body required

{
  "name": "Custom Field Name",  "value": "Value"
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
