# https://marketplace.gohighlevel.com/docs/ghl/users/search-users

# Search Users

GET 

## https://services.leadconnectorhq.com/users/search

Search Users

### Requirements

#### Scope(s)

`users.readonly`

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

**companyId** stringrequired

Company ID in which the search needs to be performed

Example: 5DP41231LkQsiKESj6rh

**query** string

The search term for the user is matched based on the user full name, email or phone

Example: John

**skip** string

No of results to be skipped before returning the result

Default value:`0`

Example: 1

**limit** string

No of results to be limited before returning the result

Default value:`25`

Example: 10

**locationId** string

Location ID in which the search needs to be performed

Example: 5DP41231LkQsiKESj6rh

**type** string

Type of the users to be filtered in the search

Example: agency

**role** string

Role of the users to be filtered in the search

Example: admin

**ids** string

List of User IDs to be filtered in the search

Example: 5DP4iH6HLkQsiKESj6rh,5DP4iH6HLkQsiKESj34h

**sort** string

The field on which sort is applied in which the results need to be sorted. Default is based on the first and last name

Example: dateAdded

**sortDirection** string

The direction in which the results need to be sorted

Example: asc

**enabled2waySync** boolean

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

**users** object\[\]

*   Array \[
    

**id** string

Example:`0IHuJvc2ofPAAA8GzTRi`

**name** string

Example:`John Deo`

**firstName** string

Example:`John`

**lastName** string

Example:`Deo`

**email** string

Example:`john@deo.com`

**phone** string

Example:`+1 808-868-8888`

**extension** string

Example:

**permissions** object

**campaignsEnabled** boolean

**Default value:** `true`

Example:`true`

**campaignsReadOnly** boolean

**Default value:** `false`

Example:`false`

**contactsEnabled** boolean

**Default value:** `true`

Example:`true`

**workflowsEnabled** boolean

**Default value:** `true`

Example:`true`

**workflowsReadOnly** boolean

**Default value:** `false`

Example:`true`

**triggersEnabled** boolean

**Default value:** `true`

Example:`true`

**funnelsEnabled** boolean

**Default value:** `true`

Example:`true`

**websitesEnabled** boolean

**Default value:** `false`

Example:`false`

**opportunitiesEnabled** boolean

**Default value:** `true`

Example:`true`

**dashboardStatsEnabled** boolean

**Default value:** `true`

Example:`true`

**bulkRequestsEnabled** boolean

**Default value:** `true`

Example:`true`

**appointmentsEnabled** boolean

**Default value:** `true`

Example:`true`

**reviewsEnabled** boolean

**Default value:** `true`

Example:`true`

**onlineListingsEnabled** boolean

**Default value:** `true`

Example:`true`

**phoneCallEnabled** boolean

**Default value:** `true`

Example:`true`

**conversationsEnabled** boolean

**Default value:** `true`

Example:`true`

**assignedDataOnly** boolean

**Default value:** `false`

Example:`false`

**adwordsReportingEnabled** boolean

**Default value:** `false`

Example:`false`

**membershipEnabled** boolean

**Default value:** `false`

Example:`false`

**facebookAdsReportingEnabled** boolean

**Default value:** `false`

Example:`false`

**attributionsReportingEnabled** boolean

**Default value:** `false`

Example:`false`

**settingsEnabled** boolean

**Default value:** `true`

Example:`true`

**tagsEnabled** boolean

**Default value:** `true`

Example:`true`

**leadValueEnabled** boolean

**Default value:** `true`

Example:`true`

**marketingEnabled** boolean

**Default value:** `true`

Example:`true`

**agentReportingEnabled** boolean

**Default value:** `true`

Example:`true`

**botService** boolean

**Default value:** `false`

Example:`false`

**socialPlanner** boolean

**Default value:** `true`

Example:`true`

**bloggingEnabled** boolean

**Default value:** `true`

Example:`true`

**invoiceEnabled** boolean

**Default value:** `true`

Example:`true`

**affiliateManagerEnabled** boolean

**Default value:** `true`

Example:`true`

**contentAiEnabled** boolean

**Default value:** `true`

Example:`true`

**refundsEnabled** boolean

**Default value:** `true`

Example:`true`

**recordPaymentEnabled** boolean

**Default value:** `true`

Example:`true`

**cancelSubscriptionEnabled** boolean

**Default value:** `true`

Example:`true`

**paymentsEnabled** boolean

**Default value:** `true`

Example:`true`

**communitiesEnabled** boolean

**Default value:** `true`

Example:`true`

**exportPaymentsEnabled** boolean

**Default value:** `true`

Example:`true`

**scopes** string

**Possible values:** \[`campaigns.readonly`, `campaigns.write`, `calendars.readonly`, `calendars/events.write`, `calendars/groups.write`, `calendars.write`, `contacts.write`, `contacts/bulkActions.write`, `workflows.readonly`, `workflows.write`, `triggers.write`, `funnels.write`, `forms.write`, `surveys.write`, `quizzes.write`, `websites.write`, `medias.write`, `medias.readonly`, `opportunities.write`, `opportunities/leadValue.readonly`, `opportunities/bulkActions.write`, `reporting/phone.readonly`, `reporting/adwords.readonly`, `reporting/facebookAds.readonly`, `reporting/attributions.readonly`, `prospecting/auditReport.write`, `reporting/reports.readonly`, `reporting/agent.readonly`, `reporting/reports.write`, `payments.write`, `payments/refunds.write`, `payments/records.write`, `payments/exports.write`, `payments/subscriptionsCancel.write`, `invoices.write`, `invoices.readonly`, `invoices/schedule.readonly`, `invoices/schedule.write`, `invoices/template.readonly`, `invoices/template.write`, `reputation/review.write`, `reputation/listing.write`, `reputation/reviewsAIAgents.write`, `conversations.write`, `conversations.readonly`, `conversations/message.readonly`, `conversations/message.write`, `contentAI.write`, `dashboard/stats.readonly`, `locations/tags.write`, `locations/tags.readonly`, `marketing.write`, `eliza.write`, `settings.write`, `socialplanner/post.write`, `socialplanner/account.readonly`, `socialplanner/account.write`, `socialplanner/category.readonly`, `socialplanner/category.write`, `socialplanner/csv.readonly`, `socialplanner/csv.write`, `socialplanner/group.write`, `socialplanner/hashtag.readonly`, `socialplanner/hashtag.write`, `socialplanner/oauth.readonly`, `socialplanner/oauth.write`, `socialplanner/post.readonly`, `socialplanner/recurring.readonly`, `socialplanner/recurring.write`, `socialplanner/review.readonly`, `socialplanner/review.write`, `socialplanner/rss.readonly`, `socialplanner/rss.write`, `socialplanner/search.readonly`, `socialplanner/setting.readonly`, `socialplanner/setting.write`, `socialplanner/stat.readonly`, `socialplanner/tag.readonly`, `socialplanner/tag.write`, `socialplanner/filters.readonly`, `socialplanner/medias.readonly`, `socialplanner/medias.write`, `socialplanner/watermarks.readonly`, `socialplanner/watermarks.write`, `socialplanner/metatag.readonly`, `socialplanner/facebook.readonly`, `socialplanner/linkedin.readonly`, `socialplanner/twitter.readonly`, `socialplanner/notification.readonly`, `socialplanner/notification.write`, `socialplanner/snapshot.readonly`, `socialplanner/snapshot.write`, `marketing/affiliate.write`, `blogs.write`, `membership.write`, `communities.write`, `gokollab.write`, `certificates.write`, `certificates.readonly`, `adPublishing.write`, `adPublishing.readonly`, `prospecting.write`, `prospecting.readonly`, `prospecting/reports.readonly`, `private-integration-location.readonly`, `private-integration-location.write`, `private-integration-company.readonly`, `private-integration-company.write`, `native-integrations.readonly`, `native-integrations.write`, `wordpress.write`, `wordpress.read`, `custom-menu-link.write`, `qrcodes.write`, `users/team-management.write`, `users/team-management.readonly`, `loginas.write`, `snapshots/api.readonly`, `snapshots/api.create`, `snapshots/api.edit`, `snapshots/api.push`, `snapshots/api.refresh`, `snapshots/api.share`, `snapshots/api.delete`, `internaltools.location-transfer.write`, `internaltools.location-transfer.readonly`, `affiliateportal.write`, `affiliateportal.readonly`, `companies.write`, `internaltools.billing.write`, `internaltools.billing.readonly`, `internaltools.billing-common.readonly`, `internaltools.billing-common.write`, `voice-ai-agents.write`, `voice-ai-agent-goals.readonly`, `voice-ai-agent-goals.write`, `voice-ai-dashboard.readonly`, `agency/launchpad.write`, `agency/launchpad.readonly`, `launchpad.write`, `launchpad.readonly`, `text-ai-agents.write`, `text-ai-agent-goals.readonly`, `text-ai-agent-goals.write`, `text-ai-agent-training.write`\]

**roles** object

**type** string

Example:`account`

**role** string

Example:`admin`

**locationIds** string\[\]

Example:`["ve9EPM428h8vShlRW1KT"]`

**restrictSubAccount** boolean

Example:`true`

**deleted** boolean

Example:`false`

**lcPhone** object

LC Phone Inbound Phone Numbers

Example:`{"locationId":"+1234556677"}`

*   \]
    

**count** number

Example:`1231`

```
{  "users": [    {      "id": "0IHuJvc2ofPAAA8GzTRi",      "name": "John Deo",      "firstName": "John",      "lastName": "Deo",      "email": "john@deo.com",      "phone": "+1 808-868-8888",      "extension": "",      "permissions": {        "campaignsEnabled": true,        "campaignsReadOnly": false,        "contactsEnabled": true,        "workflowsEnabled": true,        "workflowsReadOnly": true,        "triggersEnabled": true,        "funnelsEnabled": true,        "websitesEnabled": false,        "opportunitiesEnabled": true,        "dashboardStatsEnabled": true,        "bulkRequestsEnabled": true,        "appointmentsEnabled": true,        "reviewsEnabled": true,        "onlineListingsEnabled": true,        "phoneCallEnabled": true,        "conversationsEnabled": true,        "assignedDataOnly": false,        "adwordsReportingEnabled": false,        "membershipEnabled": false,        "facebookAdsReportingEnabled": false,        "attributionsReportingEnabled": false,        "settingsEnabled": true,        "tagsEnabled": true,        "leadValueEnabled": true,        "marketingEnabled": true,        "agentReportingEnabled": true,        "botService": false,        "socialPlanner": true,        "bloggingEnabled": true,        "invoiceEnabled": true,        "affiliateManagerEnabled": true,        "contentAiEnabled": true,        "refundsEnabled": true,        "recordPaymentEnabled": true,        "cancelSubscriptionEnabled": true,        "paymentsEnabled": true,        "communitiesEnabled": true,        "exportPaymentsEnabled": true      },      "scopes": "campaigns.readonly",      "roles": {        "type": "account",        "role": "admin",        "locationIds": [          "ve9EPM428h8vShlRW1KT"        ],        "restrictSubAccount": "true"      },      "deleted": false,      "lcPhone": {        "locationId": "+1234556677"      }    }  ],  "count": 1231}
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

**name:** [Authorization](/docs/ghl/users/users-api#authentication)**type:** http**scopes:** `users.readonly`**scheme:** bearer**bearerFormat:** JWT**in:** header**description:** Use the Access Token generated with user type as Agency (OR) Private Integration Token of Agency.

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
curl -L 'https://services.leadconnectorhq.com/users/search' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
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

companyId — queryrequired

Version — headerrequired

\---2021-07-28

Show optional parameters

query — query

skip — query

limit — query

locationId — query

type — query

role — query

ids — query

sort — query

sortDirection — query

enabled2waySync — query

\---truefalse

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
