# https://marketplace.gohighlevel.com/docs/ghl/contacts/search-contacts-advanced

# Search Contacts

POST 

## https://services.leadconnectorhq.com/contacts/search

Search contacts based on combinations of advanced filters. Documentation Link - [https://doc.clickup.com/8631005/d/h/87cpx-158396/6e629989abe7fad](https://doc.clickup.com/8631005/d/h/87cpx-158396/6e629989abe7fad)

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

*   application/json

### Body**required**

object

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Success

Bad Request

Unauthorized

## Share your feedback

★★★★★

#### Authorization: Authorization

**name:** [Authorization](/docs/ghl/contacts/contacts-api#authentication)**type:** http**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L 'https://services.leadconnectorhq.com/contacts/search' \-H 'Content-Type: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{}'
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

{}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
