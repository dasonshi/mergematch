# https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-social-media-statistics

# Get Social Media Statistics

POST 

## https://services.leadconnectorhq.com/social-media-posting/statistics

Retrieve analytics data for multiple social media accounts. Provides metrics for the last 7 days with comparison to the previous 7 days. Supports filtering by platforms and specific connected accounts.

## Request[​](#request "Direct link to Request")

### Header Parameters

**Version** stringrequired

**Possible values:** \[`2021-07-28`\]

API Version

### Query Parameters

**locationId** stringrequired

Location ID

Example: w37swmmLbA02zgqKPpxITe2

*   application/json

### Body

**profileIds** string\[\]required

Array of connected social media account IDs to fetch analytics for. This can be found as 'profileId' in /accounts api.

**Possible values:** `>= 1`

Example:`["67a5a9aa776c837de4aa5b12"]`

**platforms** string\[\]

Array of social media platforms to filter analytics by. If not provided, all platforms will be included. NOTE: Linkedin (PAGE only) and Tiktok (BUSINESS only) are supported.

**Possible values:** \[`facebook`, `instagram`, `linkedin`, `google`, `pinterest`, `youtube`, `tiktok`\]

Example:`["facebook","instagram"]`

## Responses[​](#responses "Direct link to Responses")

*   201
*   400
*   401
*   422

Successfully retrieved analytics data

*   application/json

*   Schema
*   Example (auto)

**Schema**

**results** object

Analytics data grouped by metrics and platforms

**dayRange** string\[\]

Array of day names for the analytics period

Example:`["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]`

**totals** object

Aggregated metrics totals

**posts** number

**likes** number

**followers** number

**impressions** number

**comments** number

**postPerformance** object

Post performance metrics over time

**posts** object

**property name\*** number\[\]

*   Array \[
    

number

*   \]
    

**impressions** number\[\]

**likes** number\[\]

**comments** number\[\]

**breakdowns** object

Detailed breakdowns by metric and platform

**posts** object

**total** number

**totalChange** number

**platforms** object

**property name\*** object

**value** number

**change** number

**impressions** object

**total** number

**totalChange** number

**platforms** object

**property name\*** object

**value** number

**change** number

**reach** object

**total** number

**totalChange** number

**platforms** object

**property name\*** object

**value** number

**change** number

**engagement** object

**property name\*** object

**likes** number

**comments** number

**shares** number

**change** number

**platformTotals** object

Platform-wise totals with time series data

**impressions** object

**property name\*** object

**total** number

**series** number\[\]

**followers** object

**property name\*** object

**total** number

**series** number\[\]

**likes** object

**property name\*** object

**total** number

**series** number\[\]

**demographics** object

Demographic data breakdown

**gender** object

**totals** object

**male** object

**total** number

**percentage** number

**female** object

**total** number

**percentage** number

**unknown** object

**total** number

**percentage** number

**age** object

**totals** object

**13-17** number

**18-24** number

**25-34** number

**35-44** number

**45-54** number

**55-64** number

**65+** number

**message** string

Example:`Analytics Built Successfully`

**traceId** string

Example:`42fc8dd8-d55b-475f-944f-9efb90d77564`

```
{  "results": {    "dayRange": [      "Mon",      "Tue",      "Wed",      "Thu",      "Fri",      "Sat",      "Sun"    ],    "totals": {      "posts": 0,      "likes": 0,      "followers": 0,      "impressions": 0,      "comments": 0    },    "postPerformance": {      "posts": {        "google": [          0,          0,          0,          0,          0,          0,          0        ]      },      "impressions": [        0,        0,        0,        0,        0,        0,        0      ],      "likes": [        0,        0,        0,        0,        0,        0,        0      ],      "comments": [        0,        0,        0,        0,        0,        0,        0      ]    },    "breakdowns": {      "posts": {        "total": 0,        "totalChange": 0,        "platforms": {          "google": {            "value": 0,            "change": 0          }        }      },      "impressions": {        "total": 0,        "totalChange": 0,        "platforms": {          "google": {            "value": 0,            "change": 0          }        }      },      "reach": {        "total": 0,        "totalChange": 0,        "platforms": {          "google": {            "value": 0,            "change": 0          }        }      },      "engagement": {        "google": {          "likes": 0,          "comments": 0,          "shares": 0,          "change": 0        }      }    },    "platformTotals": {      "impressions": {        "google": {          "total": 0,          "series": [            0,            0,            0,            0,            0,            0,            0          ]        }      },      "followers": {        "google": {          "total": 0,          "series": [            0,            0,            0,            0,            0,            0,            0          ]        }      },      "likes": {        "google": {          "total": 0,          "series": [            0,            0,            0,            0,            0,            0,            0          ]        }      }    },    "demographics": {      "gender": {        "totals": {          "male": {            "total": 0,            "percentage": 0          },          "female": {            "total": 0,            "percentage": 0          },          "unknown": {            "total": 0,            "percentage": 0          }        }      },      "age": {        "totals": {          "13-17": 0,          "18-24": 0,          "25-34": 0,          "35-44": 0,          "45-54": 0,          "55-64": 0,          "65+": 0        }      }    }  },  "message": "Analytics Built Successfully",  "traceId": "42fc8dd8-d55b-475f-944f-9efb90d77564"}
```

Bad Request - Occurs when more than 100 accounts are requested or invalid parameters are provided

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

Unauthorized - Invalid or missing authentication credentials

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

Unprocessable Entity - Invalid request body format

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
curl -L 'https://services.leadconnectorhq.com/social-media-posting/statistics' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-d '{  "profileIds": [    "67a5a9aa776c837de4aa5b12"  ],  "platforms": [    "facebook",    "instagram"  ]}'
```

Request Collapse all

Base URL

Edit

https://services.leadconnectorhq.com

Parameters

locationId — queryrequired

Version — headerrequired

\---2021-07-28

Body

{
  "profileIds": \[    "67a5a9aa776c837de4aa5b12"  \],  "platforms": \[    "facebook",    "instagram"  \]
}
Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
