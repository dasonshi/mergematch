# https://marketplace.gohighlevel.com/docs/oauth/Faqs

On this page

Here you will find answers to commonly encountered questions.

> If you are having trouble and cannot find a suitable answer, please reach out to support.

### How do I listen to webhook events?[​](#how-do-i-listen-to-webhook-events "Direct link to How do I listen to webhook events?")

For listening to the webhook events -

1.  Register for an app.
2.  Go to the app settings and update the webhook url (where you want to listen for events)
3.  Under the settings, also add the scope needed for the webhook event under the scopes section.
4.  Ask the location/agency admin to go to the app page in marketplace and click on "Add App".
5.  Select the location, it will redirect you to the redirect uri with the authorization code.
6.  Use the authorization code to get the access token.
7.  You would start receiving the webhook event for the location.

### How long are the access tokens valid?[​](#how-long-are-the-access-tokens-valid "Direct link to How long are the access tokens valid?")

The access tokens are valid for a day. After that, you can use the refresh token to get a new access token which will be valid for another day.

### How long are the refresh tokens valid?[​](#how-long-are-the-refresh-tokens-valid "Direct link to How long are the refresh tokens valid?")

The refresh tokens are valid for a year unless they are used. If they are used, the new refresh token is valid for a year as well.

### How should we handle token expiry?[​](#how-should-we-handle-token-expiry "Direct link to How should we handle token expiry?")

You should:

1.  Make a request to any of our APIs using the accessToken.
2.  If you get a response saying that the token is expired, refresh the token using our API and save the new access token and refresh token in your database.
3.  Make the request again with the new accessToken.

You can write a wrapper function on your end to achieve this. You can use it for all the API calls you make to our APIs.

### What are current rate limits for API 2.0?[​](#what-are-current-rate-limits-for-api-20 "Direct link to What are current rate limits for API 2.0?")

GHL has implemented rate limits on our public V2 APIs using OAuth to ensure optimal performance and stability. These limits have been adjusted to:

Burst limit: A maximum of 100 API requests per 10 seconds for each Marketplace app (i.e., client) per resource (i.e., Location or Company). Daily limit: 200,000 API requests per day for each Marketplace app (i.e., client) per resource (i.e., Location or Company).

These new limits contribute to better overall performance and stability of our system.

To monitor your limited usage, refer to the following API response headers:

'X-RateLimit-Limit-Daily': Your daily limit 'X-RateLimit-Daily-Remaining': The remaining number of requests for the day 'X-RateLimit-Interval-Milliseconds': The time interval for burst requests 'X-RateLimit-Max': The maximum request limit in the specified time interval 'X-RateLimit-Remaining': The remaining number of requests in the current time interval

Example: If the 'GHL-APP' is installed on two locations (Sub-account A and Sub-account B) on the GHL Marketplace, the rate limits for each location would be as follows:

1.  Sub-account A: 'GHL-APP' can make 200,000 API requests per day and 100 API requests per 10 seconds.
2.  Sub-account B: 'GHL-APP' can make 200,000 API requests per day and 100 API requests per 10 seconds.

## Share your feedback

★★★★★
