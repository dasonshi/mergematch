# https://marketplace.gohighlevel.com/docs/ghl/calendars/update-calendar

# Update Calendar

PUT 

## https://services.leadconnectorhq.com/calendars/:calendarId

Update calendar by ID.

### Requirements

#### Scope(s)

`calendars.write`

#### Auth Method(s)

`OAuth Access Token``Private Integration Token`

#### Token Type(s)

`Sub-Account Token`

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-04-15`\]

API Version

### Path Parameters

**calendarId** stringrequired

Calendar Id

Example: ocQHyuzHvysMo5N5VsXc

*   application/json

### Body**required**

**notifications** object\[\]deprecated

🚨 Deprecated! Please use 'Calendar Notifications APIs' instead.

*   Array \[
    

**type** string

Calendar Notification

**Possible values:** \[`email`\]

**Default value:** `email`

Example:`email`

**shouldSendToContact** booleanrequired

**shouldSendToGuest** booleanrequired

**shouldSendToUser** booleanrequired

**shouldSendToSelectedUsers** booleanrequired

**selectedUsers** stringrequired

Comma separated emails

Example:`user1@testemail.com,user2@testemail.com`

*   \]
    

**groupId** string

Group Id

Example:`BqTwX8QFwXzpegMve9EQ`

**teamMembers** object\[\]

Team members

*   Array \[
    

**userId** stringrequired

Example:`ocQHyuzHvysMo5N5VsXc`

**priority** number

**Possible values:** \[`0`, `0.5`, `1`\]

**Default value:** `0.5`

**isPrimary** boolean

Marks a user as primary. This property is required in case of collective booking calendars. Only one user can be primary.

**locationConfigurations** object\[\]

Meeting location configuration for event calendar.

*   _Multiple locations are allowed only when one team member is selected._
*   _For **Class booking** and **Collective** calendars, only one location configuration is allowed for each team member._

*   Array \[
    

**kind** stringrequired

Type of meeting location. zoom\_conference/google\_conference/ms\_teams\_conference is not supported in event calendar type

**Possible values:** \[`custom`, `zoom_conference`, `google_conference`, `inbound_call`, `outbound_call`, `physical`, `booker`, `ms_teams_conference`\]

Example:`custom`

**location** string

Address for meeting location. Not applicable on "zoom\_conference", "google\_conference" and "ms\_teams\_conference" kind

*   \]
    

*   \]
    

**eventType** string

**Possible values:** \[`RoundRobin_OptimizeForAvailability`, `RoundRobin_OptimizeForEqualDistribution`\]

**name** string

Example:`test calendar`

**description** string

Example:`this is used for testing`

**slug** string

Example:`test1`

**widgetSlug** string

Example:`test1`

**widgetType** string

Calendar widget type. Choose "default" for "neo" and "classic" for "classic" layout.

**Possible values:** \[`default`, `classic`\]

**Default value:** `classic`

Example:`classic`

**eventTitle** string

**eventColor** string

**Default value:** `#039be5`

**locationConfigurations** object\[\]

Meeting location configuration for event calendar

*   Array \[
    

**kind** stringrequired

Type of meeting location. zoom\_conference/google\_conference/ms\_teams\_conference is not supported in event calendar type

**Possible values:** \[`custom`, `zoom_conference`, `google_conference`, `inbound_call`, `outbound_call`, `physical`, `booker`, `ms_teams_conference`\]

Example:`custom`

**location** string

Address for meeting location. Not applicable on "zoom\_conference", "google\_conference" and "ms\_teams\_conference" kind

*   \]
    

**slotDuration** number

This controls the duration of the meeting

**Default value:** `30`

**slotDurationUnit** string

Unit for slot duration.

**Possible values:** \[`mins`, `hours`\]

**preBufferUnit** string

Unit for pre-buffer.

**Possible values:** \[`mins`, `hours`\]

**slotInterval** number

Slot interval reflects the amount of time the between booking slots that will be shown in the calendar.

**Default value:** `30`

**slotIntervalUnit** string

Unit for slot interval.

**Possible values:** \[`mins`, `hours`\]

**slotBuffer** number

Slot-Buffer is additional time that can be added after an appointment, allowing for extra time to wrap up

**preBuffer** number

Pre-Buffer is additional time that can be added before an appointment, allowing for extra time to get ready

**appoinmentPerSlot** number

**appoinmentPerDay** number

Number of appointments that can be booked for a given day

**allowBookingAfter** number

Minimum scheduling notice for events

**allowBookingAfterUnit** string

Unit for minimum scheduling notice

**Possible values:** \[`hours`, `days`, `weeks`, `months`\]

Example:`days`

**allowBookingFor** number

Minimum number of days/weeks/months for which to allow booking events

**allowBookingForUnit** string

Unit for controlling the duration for which booking would be allowed for

**Possible values:** \[`days`, `weeks`, `months`\]

Example:`days`

**openHours** object\[\]

*   Array \[
    

**daysOfTheWeek** number\[\]required

**Possible values:** `<= 6`

**hours** object\[\]required

*   Array \[
    

**openHour** numberrequired

**Possible values:** `<= 23`

**openMinute** numberrequired

**Possible values:** `<= 60`

**closeHour** numberrequired

**Possible values:** `<= 23`

**closeMinute** numberrequired

**Possible values:** `<= 60`

*   \]
    

*   \]
    

**enableRecurring** boolean

Enable recurring appointments for the calendars. Please note that only one member should be added in the calendar to enable this

**Default value:** `false`

**recurring** object

**freq** string

**Possible values:** \[`DAILY`, `WEEKLY`, `MONTHLY`\]

**count** number

Number of recurrences

**Possible values:** `<= 24`

**bookingOption** string

This setting contols what to do incase a recurring slot is unavailable

**Possible values:** \[`skip`, `continue`, `book_next`\]

**bookingOverlapDefaultStatus** string

This setting contols what to do incase a recurring slot is unavailable

**Possible values:** \[`confirmed`, `new`\]

**formId** string

**stickyContact** boolean

**isLivePaymentMode** boolean

**autoConfirm** boolean

**shouldSendAlertEmailsToAssignedMember** boolean

**alertEmail** string

**googleInvitationEmails** boolean

**allowReschedule** boolean

**allowCancellation** boolean

**shouldAssignContactToTeamMember** boolean

**shouldSkipAssigningContactForExisting** boolean

**notes** string

**pixelId** string

**formSubmitType** string

**Possible values:** \[`RedirectURL`, `ThankYouMessage`\]

**Default value:** `ThankYouMessage`

**formSubmitRedirectURL** string

**formSubmitThanksMessage** string

**availabilityType** number

Determines which availability type to consider:

*   **1**: Only custom availabilities will be used.
*   **0**: Only open hours will be used.
*   **null**: Both the custom availabilities and open hours will be considered.

**Possible values:** \[`0`, `1`\]

**availabilities** object\[\]

This is only to set the custom availability. For standard availability, use the openHours property

*   Array \[
    

**date** stringrequired

Formulate the date string in the format of `<YYYY-MM-DD in local timezone>T00:00:00.000Z`.

Example:`2023-09-24T00:00:00.000Z`

**hours** object\[\]required

*   Array \[
    

**openHour** numberrequired

**Possible values:** `<= 23`

**openMinute** numberrequired

**Possible values:** `<= 60`

**closeHour** numberrequired

**Possible values:** `<= 23`

**closeMinute** numberrequired

**Possible values:** `<= 60`

*   \]
    

**deleted** boolean

**Default value:** `false`

**id** string

The ID of the custom availability object. It is required while updating or deleting the existing custom date availability

*   \]
    

**guestType** string

**Possible values:** \[`count_only`, `collect_detail`\]

**consentLabel** string

**calendarCoverImage** string

**lookBusyConfig** object

Look Busy Configuration

**enabled** booleanrequired

Apply Look Busy

**Default value:** `false`

Example:`true`

**LookBusyPercentage** numberrequired

Percentage of slots that will be hidden

**isActive** boolean

## Responses[​](#responses "Direct link to Responses")

*   200
*   400
*   401

Successful response

*   application/json

*   Schema
*   Example (auto)

**Schema**

**calendar** objectrequired

**isActive** boolean

Should the created calendar be active or draft

**Default value:** `true`

**notifications** object\[\]deprecated

🚨 Deprecated! Please use 'Calendar Notifications APIs' instead.

*   Array \[
    

**type** string

Calendar Notification

**Possible values:** \[`email`\]

**Default value:** `email`

Example:`email`

**shouldSendToContact** booleanrequired

**shouldSendToGuest** booleanrequired

**shouldSendToUser** booleanrequired

**shouldSendToSelectedUsers** booleanrequired

**selectedUsers** stringrequired

Comma separated emails

Example:`user1@testemail.com,user2@testemail.com`

*   \]
    

**locationId** stringrequired

Example:`ocQHyuzHvysMo5N5VsXc`

**groupId** string

Group Id

Example:`BqTwX8QFwXzpegMve9EQ`

**teamMembers** object\[\]

Team members are for calendars of type: Round Robin, Collective, Class, Service.

*   Array \[
    

**userId** stringrequired

Example:`ocQHyuzHvysMo5N5VsXc`

**priority** number

**Possible values:** \[`0`, `0.5`, `1`\]

**Default value:** `0.5`

**meetingLocationType** stringdeprecated

🚨 Deprecated! Use `locationConfigurations.kind` instead.

**Possible values:** \[`custom`, `zoom`, `gmeet`, `phone`, `address`, `teams`, `booker`\]

**Default value:** `custom`

Example:`custom`

**meetingLocation** stringdeprecated

🚨 Deprecated! Use `locationConfigurations.location` instead.

**isPrimary** boolean

Marks a user as primary. This property is required in case of collective booking calendars. Only one user can be primary.

**locationConfigurations** object\[\]

Meeting location configurations

*   Array \[
    

**kind** stringrequired

Type of meeting location. zoom\_conference/google\_conference/ms\_teams\_conference is not supported in event calendar type

**Possible values:** \[`custom`, `zoom_conference`, `google_conference`, `inbound_call`, `outbound_call`, `physical`, `booker`, `ms_teams_conference`\]

Example:`custom`

**location** string

Address for meeting location. Not applicable on "zoom\_conference", "google\_conference" and "ms\_teams\_conference" kind

**meetingId** string

Unique ID used to select a specific meeting location

Example:`my_conference_id`

*   \]
    

*   \]
    

**eventType** string

**Possible values:** \[`RoundRobin_OptimizeForAvailability`, `RoundRobin_OptimizeForEqualDistribution`\]

**Default value:** `RoundRobin_OptimizeForAvailability`

**name** stringrequired

Example:`test calendar`

**description** string

Example:`this is used for testing`

**slug** string

Example:`test1`

**widgetSlug** string

Example:`test1`

**calendarType** string

**Possible values:** \[`round_robin`, `event`, `class_booking`, `collective`, `service_booking`, `personal`\]

**widgetType** string

Calendar widget type. Choose "default" for "neo" and "classic" for "classic" layout.

**Possible values:** \[`default`, `classic`\]

**Default value:** `classic`

Example:`classic`

**eventTitle** string

**Default value:** `{{contact.name}}`

**eventColor** string

**Default value:** `#039be5`

**meetingLocation** stringdeprecated

🚨 Deprecated! Use `locationConfigurations.location` or `teamMembers[].locationConfigurations.location` instead.

**locationConfigurations** object\[\]

Meeting location configuration for event calendar

*   Array \[
    

**kind** stringrequired

Type of meeting location. zoom\_conference/google\_conference/ms\_teams\_conference is not supported in event calendar type

**Possible values:** \[`custom`, `zoom_conference`, `google_conference`, `inbound_call`, `outbound_call`, `physical`, `booker`, `ms_teams_conference`\]

Example:`custom`

**location** string

Address for meeting location. Not applicable on "zoom\_conference", "google\_conference" and "ms\_teams\_conference" kind

**meetingId** string

Unique ID used to select a specific meeting location

Example:`my_conference_id`

*   \]
    

**slotDuration** number

This controls the duration of the meeting

**Default value:** `30`

**slotDurationUnit** string

Unit for slot duration.

**Possible values:** \[`mins`, `hours`\]

**slotInterval** number

Slot interval reflects the amount of time the between booking slots that will be shown in the calendar.

**Default value:** `30`

**slotIntervalUnit** string

Unit for slot interval.

**Possible values:** \[`mins`, `hours`\]

**slotBuffer** number

Slot-Buffer is additional time that can be added after an appointment, allowing for extra time to wrap up

**slotBufferUnit** string

Unit for slot buffer.

**Possible values:** \[`mins`, `hours`\]

**preBuffer** number

Pre-Buffer is additional time that can be added before an appointment, allowing for extra time to get ready

**preBufferUnit** string

Unit for pre-buffer.

**Possible values:** \[`mins`, `hours`\]

**appoinmentPerSlot** number

Maximum bookings per slot (per user). Maximum seats per slot in case of Class Booking Calendar.

**Default value:** `1`

**appoinmentPerDay** number

Number of appointments that can be booked for a given day

**allowBookingAfter** number

Minimum scheduling notice for events

**allowBookingAfterUnit** string

Unit for minimum scheduling notice

**Possible values:** \[`hours`, `days`, `weeks`, `months`\]

Example:`days`

**allowBookingFor** number

Minimum number of days/weeks/months for which to allow booking events

**allowBookingForUnit** string

Unit for controlling the duration for which booking would be allowed for

**Possible values:** \[`days`, `weeks`, `months`\]

Example:`days`

**openHours** object\[\]

This is only to set the standard availability. For custom availability, use the availabilities property

*   Array \[
    

**daysOfTheWeek** number\[\]required

**Possible values:** `<= 6`

**hours** object\[\]required

*   Array \[
    

**openHour** numberrequired

**Possible values:** `<= 23`

**openMinute** numberrequired

**Possible values:** `<= 60`

**closeHour** numberrequired

**Possible values:** `<= 23`

**closeMinute** numberrequired

**Possible values:** `<= 60`

*   \]
    

*   \]
    

**enableRecurring** boolean

Enable recurring appointments for the calendars. Please note that only one member should be added in the calendar to enable this

**Default value:** `false`

**recurring** object

**freq** string

**Possible values:** \[`DAILY`, `WEEKLY`, `MONTHLY`\]

**count** number

Number of recurrences

**Possible values:** `<= 24`

**bookingOption** string

This setting contols what to do incase a recurring slot is unavailable

**Possible values:** \[`skip`, `continue`, `book_next`\]

**bookingOverlapDefaultStatus** string

This setting contols what to do incase a recurring slot is unavailable

**Possible values:** \[`confirmed`, `new`\]

**formId** string

**stickyContact** boolean

**isLivePaymentMode** boolean

**autoConfirm** boolean

**Default value:** `true`

**shouldSendAlertEmailsToAssignedMember** boolean

**alertEmail** string

**googleInvitationEmails** boolean

**Default value:** `false`

**allowReschedule** boolean

**Default value:** `true`

**allowCancellation** boolean

**Default value:** `true`

**shouldAssignContactToTeamMember** boolean

**shouldSkipAssigningContactForExisting** boolean

**notes** string

**pixelId** string

**formSubmitType** string

**Possible values:** \[`RedirectURL`, `ThankYouMessage`\]

**Default value:** `ThankYouMessage`

**formSubmitRedirectURL** string

**formSubmitThanksMessage** string

**availabilityType** number

Determines which availability type to consider:

*   **1**: Only custom availabilities will be used.
*   **0**: Only open hours will be used.
*   **null**: Both custom availabilities and open hours will be considered.

**Possible values:** \[`0`, `1`\]

**availabilities** object\[\]

This is only to set the custom availability. For standard availability, use the openHours property

*   Array \[
    

**date** stringrequired

Formulate the date string in the format of `<YYYY-MM-DD in local timezone>T00:00:00.000Z`.

Example:`2023-09-24T00:00:00.000Z`

**hours** object\[\]required

*   Array \[
    

**openHour** numberrequired

**Possible values:** `<= 23`

**openMinute** numberrequired

**Possible values:** `<= 60`

**closeHour** numberrequired

**Possible values:** `<= 23`

**closeMinute** numberrequired

**Possible values:** `<= 60`

*   \]
    

**deleted** boolean

**Default value:** `false`

*   \]
    

**guestType** string

**Possible values:** \[`count_only`, `collect_detail`\]

**consentLabel** string

**calendarCoverImage** string

Example:`https://path-to-image.com`

**lookBusyConfig** object

Look Busy Configuration

**enabled** booleanrequired

Apply Look Busy

**Default value:** `false`

Example:`true`

**LookBusyPercentage** numberrequired

Percentage of slots that will be hidden

**id** stringrequired

Example:`0TkCdp9PfvLeWKYRRvIz`

```
{  "calendar": {    "isActive": true,    "locationId": "ocQHyuzHvysMo5N5VsXc",    "groupId": "BqTwX8QFwXzpegMve9EQ",    "teamMembers": [      {        "userId": "ocQHyuzHvysMo5N5VsXc",        "priority": 0.5,        "isPrimary": true,        "locationConfigurations": [          {            "kind": "custom",            "location": "string",            "meetingId": "my_conference_id"          }        ]      }    ],    "eventType": "RoundRobin_OptimizeForAvailability",    "name": "test calendar",    "description": "this is used for testing",    "slug": "test1",    "widgetSlug": "test1",    "calendarType": "round_robin",    "widgetType": "classic",    "eventTitle": "{{contact.name}}",    "eventColor": "#039be5",    "locationConfigurations": [      {        "kind": "custom",        "location": "string",        "meetingId": "my_conference_id"      }    ],    "slotDuration": 30,    "slotDurationUnit": "mins",    "slotInterval": 30,    "slotIntervalUnit": "mins",    "slotBuffer": 0,    "slotBufferUnit": "mins",    "preBuffer": 0,    "preBufferUnit": "mins",    "appoinmentPerSlot": 1,    "appoinmentPerDay": 0,    "allowBookingAfter": 0,    "allowBookingAfterUnit": "days",    "allowBookingFor": 0,    "allowBookingForUnit": "days",    "openHours": [      {        "daysOfTheWeek": [          0        ],        "hours": [          {            "openHour": 0,            "openMinute": 0,            "closeHour": 0,            "closeMinute": 0          }        ]      }    ],    "enableRecurring": false,    "recurring": {      "freq": "DAILY",      "count": 0,      "bookingOption": "skip",      "bookingOverlapDefaultStatus": "confirmed"    },    "formId": "string",    "stickyContact": true,    "isLivePaymentMode": true,    "autoConfirm": true,    "shouldSendAlertEmailsToAssignedMember": true,    "alertEmail": "string",    "googleInvitationEmails": false,    "allowReschedule": true,    "allowCancellation": true,    "shouldAssignContactToTeamMember": true,    "shouldSkipAssigningContactForExisting": true,    "notes": "string",    "pixelId": "string",    "formSubmitType": "ThankYouMessage",    "formSubmitRedirectURL": "string",    "formSubmitThanksMessage": "string",    "availabilityType": 0,    "availabilities": [      {        "date": "2023-09-24T00:00:00.000Z",        "hours": [          {            "openHour": 0,            "openMinute": 0,            "closeHour": 0,            "closeMinute": 0          }        ],        "deleted": false      }    ],    "guestType": "count_only",    "consentLabel": "string",    "calendarCoverImage": "https://path-to-image.com",    "lookBusyConfig": {      "enabled": true,      "LookBusyPercentage": 0    },    "id": "0TkCdp9PfvLeWKYRRvIz"  }}
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

**name:** [Authorization](/docs/ghl/calendars/calendars-api#authentication)**type:** http**scopes:** `calendars.write`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Sub-Account (OR) Private Integration Token of Sub-Account.

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
curl -L -X PUT 'https://services.leadconnectorhq.com/calendars/:calendarId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "groupId": "BqTwX8QFwXzpegMve9EQ",  "teamMembers": [    {      "userId": "ocQHyuzHvysMo5N5VsXc",      "priority": 0.5,      "isPrimary": true,      "locationConfigurations": [        {          "kind": "custom",          "location": "string"        }      ]    }  ],  "eventType": "RoundRobin_OptimizeForAvailability",  "name": "test calendar",  "description": "this is used for testing",  "slug": "test1",  "widgetSlug": "test1",  "widgetType": "classic",  "eventTitle": "string",  "eventColor": "#039be5",  "locationConfigurations": [    {      "kind": "custom",      "location": "string"    }  ],  "slotDuration": 30,  "slotDurationUnit": "mins",  "preBufferUnit": "mins",  "slotInterval": 30,  "slotIntervalUnit": "mins",  "slotBuffer": 0,  "preBuffer": 0,  "appoinmentPerSlot": 0,  "appoinmentPerDay": 0,  "allowBookingAfter": 0,  "allowBookingAfterUnit": "days",  "allowBookingFor": 0,  "allowBookingForUnit": "days",  "openHours": [    {      "daysOfTheWeek": [        0      ],      "hours": [        {          "openHour": 0,          "openMinute": 0,          "closeHour": 0,          "closeMinute": 0        }      ]    }  ],  "enableRecurring": false,  "recurring": {    "freq": "DAILY",    "count": 0,    "bookingOption": "skip",    "bookingOverlapDefaultStatus": "confirmed"  },  "formId": "string",  "stickyContact": true,  "isLivePaymentMode": true,  "autoConfirm": true,  "shouldSendAlertEmailsToAssignedMember": true,  "alertEmail": "string",  "googleInvitationEmails": true,  "allowReschedule": true,  "allowCancellation": true,  "shouldAssignContactToTeamMember": true,  "shouldSkipAssigningContactForExisting": true,  "notes": "string",  "pixelId": "string",  "formSubmitType": "ThankYouMessage",  "formSubmitRedirectURL": "string",  "formSubmitThanksMessage": "string",  "availabilityType": 0,  "availabilities": [    {      "date": "2023-09-24T00:00:00.000Z",      "hours": [        {          "openHour": 0,          "openMinute": 0,          "closeHour": 0,          "closeMinute": 0        }      ],      "deleted": false,      "id": "string"    }  ],  "guestType": "count_only",  "consentLabel": "string",  "calendarCoverImage": "string",  "lookBusyConfig": {    "enabled": true,    "LookBusyPercentage": 0  },  "isActive": true}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Auth

Bearer Token

Parameters

calendarId — pathrequired

Version — headerrequired

\---2021-04-15

Body required

{
  "groupId": "BqTwX8QFwXzpegMve9EQ",  "teamMembers": \[    {      "userId": "ocQHyuzHvysMo5N5VsXc",      "priority": 0.5,      "isPrimary": true,      "locationConfigurations": \[        {          "kind": "custom",          "location": "string"        }      \]    }  \],  "eventType": "RoundRobin\_OptimizeForAvailability",  "name": "test calendar",  "description": "this is used for testing",  "slug": "test1",  "widgetSlug": "test1",  "widgetType": "classic",  "eventTitle": "string",  "eventColor": "#039be5",  "locationConfigurations": \[    {      "kind": "custom",      "location": "string"    }  \],  "slotDuration": 30,  "slotDurationUnit": "mins",  "preBufferUnit": "mins",  "slotInterval": 30,  "slotIntervalUnit": "mins",  "slotBuffer": 0,  "preBuffer": 0,  "appoinmentPerSlot": 0,  "appoinmentPerDay": 0,  "allowBookingAfter": 0,  "allowBookingAfterUnit": "days",  "allowBookingFor": 0,  "allowBookingForUnit": "days",  "openHours": \[    {      "daysOfTheWeek": \[        0      \],      "hours": \[        {          "openHour": 0,          "openMinute": 0,          "closeHour": 0,          "closeMinute": 0        }      \]    }  \],  "enableRecurring": false,  "recurring": {    "freq": "DAILY",    "count": 0,    "bookingOption": "skip",    "bookingOverlapDefaultStatus": "confirmed"  },  "formId": "string",  "stickyContact": true,  "isLivePaymentMode": true,  "autoConfirm": true,  "shouldSendAlertEmailsToAssignedMember": true,  "alertEmail": "string",  "googleInvitationEmails": true,  "allowReschedule": true,  "allowCancellation": true,  "shouldAssignContactToTeamMember": true,  "shouldSkipAssigningContactForExisting": true,  "notes": "string",  "pixelId": "string",  "formSubmitType": "ThankYouMessage",  "formSubmitRedirectURL": "string",  "formSubmitThanksMessage": "string",  "availabilityType": 0,  "availabilities": \[    {      "date": "2023-09-24T00:00:00.000Z",      "hours": \[        {          "openHour": 0,          "openMinute": 0,          "closeHour": 0,          "closeMinute": 0        }      \],      "deleted": false,      "id": "string"    }  \],  "guestType": "count\_only",  "consentLabel": "string",  "calendarCoverImage": "string",  "lookBusyConfig": {    "enabled": true,    "LookBusyPercentage": 0  },  "isActive": true
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
