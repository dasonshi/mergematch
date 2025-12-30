# https://marketplace.gohighlevel.com/docs/ghl/conversations/cancel-scheduled-email-message

# Cancel a scheduled email message.

DELETE 

## https://services.leadconnectorhq.com/conversations/messages/email/:emailMessageId/schedule

Post the messageId for the API to delete a scheduled email message.  

## Request[​](#request "Direct link to Request")

### Path Parameters

**emailMessageId** stringrequired

Email Message Id

Example: ve9EPM428h8vShlRW1KT

## Responses[​](#responses "Direct link to Responses")

*   200

The scheduled email message was cancelled successfully

*   application/json

*   Schema
*   Example (auto)

**Schema**

**status** numberrequired

HTTP Status code of the request

Example:`404`

**message** stringrequired

Error message of the request

Example:`Failed cancel the scheduled message`

```
{  "status": 404,  "message": "Failed cancel the scheduled message"}
```

## Share your feedback

★★★★★

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
curl -L -X DELETE 'https://services.leadconnectorhq.com/conversations/messages/email/:emailMessageId/schedule' \-H 'Accept: application/json'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Parameters

emailMessageId — pathrequired

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
