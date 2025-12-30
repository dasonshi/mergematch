# https://marketplace.gohighlevel.com/docs/webhook/WebhookIntegrationGuide

On this page

## What are Webhooks?[​](#what-are-webhooks "Direct link to What are Webhooks?")

Webhooks are a way for applications to communicate in real-time. Think of them as **automatic notifications** that are sent to your application when something happens in our platform.

### Real-World Example[​](#real-world-example "Direct link to Real-World Example")

Imagine you're building an e-commerce app:

*   When a customer places an order → You get a webhook notification
*   When the order status changes → You get another webhook notification
*   When the payment is processed → You get yet another notification

This way, your app stays updated without constantly asking "has anything changed?"

## Getting Started[​](#getting-started "Direct link to Getting Started")

### Step 1: Create Your Webhook Endpoint[​](#step-1-create-your-webhook-endpoint "Direct link to Step 1: Create Your Webhook Endpoint")

First, you need a public URL that can receive webhook notifications. Here are some options:

#### Option A: Use a Cloud Service[​](#option-a-use-a-cloud-service "Direct link to Option A: Use a Cloud Service")

*   **Heroku**: Deploy a simple web app
*   **AWS Lambda**: Serverless function
*   **Google Cloud Functions**: Serverless function
*   **Vercel**: Easy deployment platform

#### Option B: Use a Webhook Testing Service[​](#option-b-use-a-webhook-testing-service "Direct link to Option B: Use a Webhook Testing Service")

*   **webhook.site**: Get a temporary URL for testing
*   **ngrok**: Expose your local server to the internet

#### Option C: Use Your Own Server[​](#option-c-use-your-own-server "Direct link to Option C: Use Your Own Server")

*   Deploy a web application on your server
*   Ensure it's accessible via HTTPS

### Step 2: Create a Simple Webhook Handler[​](#step-2-create-a-simple-webhook-handler "Direct link to Step 2: Create a Simple Webhook Handler")

Here's a basic example using Node.js and Express:

```
const express = require('express')const app = express()// Parse JSON requestsapp.use(express.json())// Your webhook endpointapp.post('/webhooks', (req, res) => {  console.log('Received webhook:', req.body)  // Process the webhook data here  const eventType = req.body.type  const eventData = req.body.data  // Handle different event types  switch (eventType) {    case 'ContactCreate':      console.log('New contact created:', eventData)      // Add your logic here      break    case 'ContactUpdate':      console.log('Contact updated:', eventData)      // Add your logic here      break    default:      console.log('Unknown event type:', eventType)  }  // Always respond with 200 OK  res.status(200).json({ success: true })})// Start your serverconst PORT = process.env.PORT || 3000app.listen(PORT, () => {  console.log(`Webhook server running on port ${PORT}`)})
```

### Step 3: Test Your Endpoint[​](#step-3-test-your-endpoint "Direct link to Step 3: Test Your Endpoint")

Before connecting to our platform, test your endpoint:

```
curl -X POST https://your-app.com/webhooks \  -H "Content-Type: application/json" \  -d '{    "type": "ContactCreate",    "timestamp": "2025-01-28T14:35:00.000Z",    "webhookId": "test-123",    "data": {      "firstName": "John",      "lastName": "Doe",      "email": "john@example.com"    }  }'
```

## Available Webhook Events[​](#available-webhook-events "Direct link to Available Webhook Events")

We offer a comprehensive set of webhook events that cover all major activities in our platform. Here's a quick overview of the main event categories:

### Event Categories[​](#event-categories "Direct link to Event Categories")

*   **Contact Events**: Contact creation, updates, deletion, and tag changes
*   **Opportunity Events**: Opportunity lifecycle management and status updates
*   **Task Events**: Task creation, completion, and deletion
*   **Appointment Events**: Calendar appointment scheduling and updates
*   **Invoice Events**: Invoice lifecycle from creation to payment
*   **Product Events**: Product catalog management
*   **Association Events**: Relationship management between records
*   **Location Events**: Location creation and updates
*   **User Events**: User account management
*   **And many more...**

### Detailed Event Documentation[​](#detailed-event-documentation "Direct link to Detailed Event Documentation")

For complete details about each webhook event, including:

*   Exact payload structure for each event
*   Field descriptions and data types
*   Sample JSON responses
*   Event-specific examples

**📖 [View Complete Webhook Documentation →](/docs/category/webhook)**

This detailed documentation provides comprehensive information about every available webhook event, including exact payload structures, field descriptions, and real-world examples.

## Security: Verifying Webhook Authenticity[​](#security-verifying-webhook-authenticity "Direct link to Security: Verifying Webhook Authenticity")

### Why Verification is Important[​](#why-verification-is-important "Direct link to Why Verification is Important")

Webhooks can be spoofed by malicious actors. Always verify that webhooks are coming from our platform.

### How to Verify[​](#how-to-verify "Direct link to How to Verify")

We use a private key to encrypt our webhooks which can be decrypted using our public key

### GHL Public Key:[​](#ghl-public-key "Direct link to GHL Public Key:")

```
-----BEGIN PUBLIC KEY-----MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAokvo/r9tVgcfZ5DysOSCFrm602qYV0MaAiNnX9O8KxMbiyRKWeL9JpCpVpt4XHIcBOK4u3cLSqJGOLaPuXw6dO0t6Q/ZVdAV5Phz+ZtzPL16iCGeK9po6D6JHBpbi989mmzMryUnQJezlYJ3DVfBcsedpinheNnyYeFXolrJvcsjDtfAeRx5ByHQmTnSdFUzuAnC9/GepgLT9SM4nCpvuxmZMxrJt5Rw+VUaQ9B8JSvbMPpez4peKaJPZHBbU3OdeCVx5klVXXZQGNHOs8gF3kvoV5rTnXV0IknLBXlcKKAQLZcY/Q9rG6Ifi9c+5vqlvHPCUJFT5XUGG5RKgOKUJ062fRtN+rLYZUV+BjafxQauvC8wSWeYja63VSUruvmNj8xkx2zE/Juc+yjLjTXpIocmaiFeAO6fUtNjDeFVkhf5LNb59vECyrHD2SQIrhgXpO4Q3dVNA5rw576PwTzNh/AMfHKIjE4xQA1SZuYJmNnmVZLIZBlQAF9Ntd03rfadZ+yDiOXCCs9FkHibELhCHULgCsnuDJHcrGNd5/Ddm5hxGQ0ASitgHeMZ0kcIOwKDOzOU53lDza6/Y09T7sYJPQe7z0cvj7aE4B+Ax1ZoZGPzpJlZtGXCsu9aTEGEnKzmsFqwcSsnw3JB31IGKAykT1hhTiaCeIY/OwwwNUY2yvcCAwEAAQ==-----END PUBLIC KEY-----
```

We include a digital signature in the `x-wh-signature` header. Here's how to verify it:

```
const crypto = require('crypto');const publicKey = `<use_the_above_key>`;function verifySignature(payload, signature) {  const verifier = crypto.createVerify('SHA256');  verifier.update(payload);  verifier.end();  return verifier.verify(publicKey, signature, 'base64');}// Example usageconst payload = JSON.stringify({  "timestamp": "2025-01-28T14:35:00Z",  "webhookId": "abc123xyz",  ...<add_other_webhook_data>});const signature = "<received-x-wh-signature>";const isValid = verifySignature(payload, signature);return isValid;
```

## Setting Up Your Integration[​](#setting-up-your-integration "Direct link to Setting Up Your Integration")

### 1\. Create Your OAuth Application[​](#1-create-your-oauth-application "Direct link to 1. Create Your OAuth Application")

You'll need to create an OAuth application in our marketplace via the dashboard. This will give you:

*   A webhook URL to receive notifications
*   Access to specific data based on scopes
*   Ability to subscribe to specific events

### 2\. Configure Your Webhook URL[​](#2-configure-your-webhook-url "Direct link to 2. Configure Your Webhook URL")

After filling in all the mandatory information, head down to the Auth section under the advanced setting.

Select the scope of you application from the drop down

![OAuth Scopes Configuration](https://storage.googleapis.com/staging-public-api-documentation/webhook/WebhookIntegrationGuide/scopes.png)

### 3\. Choose Your Events[​](#3-choose-your-events "Direct link to 3. Choose Your Events")

After defining the scopes, head to the webhook section under the advanced settings

Turn on and paste your webhook URL against the events you wish to receive a webhook response to

![Webhook URL Configuration](https://storage.googleapis.com/staging-public-api-documentation/webhook/WebhookIntegrationGuide/webhook_url.png)

## Handling Webhooks Reliably[​](#handling-webhooks-reliably "Direct link to Handling Webhooks Reliably")

### Best Practices[​](#best-practices "Direct link to Best Practices")

1.  **Always Respond Quickly**
    
    *   Process webhooks asynchronously if needed
    *   Return 200 OK immediately
    *   Do heavy processing in the background
2.  **Handle Duplicates**
    
    *   Store webhook IDs to prevent duplicate processing
    *   Make your processing idempotent (safe to run multiple times)
3.  **Log Everything**
    
    *   Log all incoming webhooks
    *   Log processing results
    *   Log errors for debugging

### Example Implementation[​](#example-implementation "Direct link to Example Implementation")

```
const express = require('express')const crypto = require('crypto')const app = express()app.use(express.json())// Store processed webhook IDs (use a database in production)const processedWebhooks = new Set()app.post('/webhooks', async (req, res) => {  try {    // 1. Verify signature    const signature = req.headers['x-wh-signature']    if (!verifyWebhookSignature(req.body, signature)) {      console.error('Invalid signature')      return res.status(401).json({ error: 'Invalid signature' })    }    // 2. Check for duplicates    if (processedWebhooks.has(req.body.webhookId)) {      console.log('Duplicate webhook, skipping:', req.body.webhookId)      return res.status(200).json({ message: 'Already processed' })    }    // 3. Log the webhook    console.log('Processing webhook:', req.body.type, req.body.webhookId)    // 4. Process asynchronously (don't block the response)    setImmediate(() => {      processWebhookAsync(req.body)    })    // 5. Mark as processed    processedWebhooks.add(req.body.webhookId)    // 6. Respond immediately    res.status(200).json({ success: true })  } catch (error) {    console.error('Webhook processing error:', error)    res.status(200).json({ success: false, error: 'Processing failed' })  }})async function processWebhookAsync(webhook) {  try {    switch (webhook.type) {      case 'ContactCreate':        await handleNewContact(webhook.data)        break      case 'ContactUpdate':        await handleContactUpdate(webhook.data)        break      // Add more cases as needed    }    console.log('Successfully processed webhook:', webhook.webhookId)  } catch (error) {    console.error('Failed to process webhook:', webhook.webhookId, error)  }}function verifyWebhookSignature(payload, signature) {  // Implementation from the security section above}
```

## Error Handling and Retries[​](#error-handling-and-retries "Direct link to Error Handling and Retries")

### How Our Retry System Works[​](#how-our-retry-system-works "Direct link to How Our Retry System Works")

If your webhook endpoint fails, we'll automatically retry:

*   **Retry Triggers**: 408 (timeout), 429 (rate limit), 5xx (server errors)
*   **Max Retries**: 10 attempts
*   **Backoff Strategy**: Exponential backoff with doubling
*   **Minimum backoff**: 10 seconds
*   **Jitter**: Random 1-10 second delay added to prevent thundering herd
*   **Total retry duration**: Up to 7200 seconds (2 hours) or 10 attempts, whichever occurs first

### Understanding Jitter[​](#understanding-jitter "Direct link to Understanding Jitter")

**What is Jitter?** Jitter is a random delay added to retry attempts to prevent the "thundering herd" problem. When multiple webhooks fail at the same time, without jitter they would all retry at exactly the same time, potentially overwhelming your server.

**How it works:**

*   Only the first retry gets a random delay between 1-10 seconds added to the base backoff time
*   This spreads out the initial retry attempts, reducing server load
*   Example: If base backoff is 0s, actual delay could be 1-10s
*   Subsequent retries follow pure exponential backoff without additional jitter

**Example retry timeline:**

**Example with 3s jitter:**

1.  **First retry**: 0s base + 3s jitter = 3s delay
2.  **Second retry**: 10s base (no jitter) = 13s delay
3.  **Third retry**: 20s base (no jitter) = 23s delay
4.  **Fourth retry**: 40s base (no jitter) = 43s delay
5.  **And so on...** (doubling continues until 10 attempts or 7200s, whichever occurs first)

### What You Should Do[​](#what-you-should-do "Direct link to What You Should Do")

1.  **Return 200 OK for Success**
    
    ```
    res.status(200).json({ success: true })
    ```
    
2.  **Return 200 OK Even for Processing Errors**
    
    ```
    try {  await processWebhook(req.body)  res.status(200).json({ success: true })} catch (error) {  console.error('Processing failed:', error)  // Still return 200 to acknowledge receipt  res.status(200).json({ success: false, error: 'Processing failed' })}
    ```
    
3.  **Only Return Error Codes for Real Issues**
    
    *   `408`: Your server is too slow
    *   `429`: You're receiving too many requests
    *   `5xx`: Your server is down or broken

## Testing Your Integration[​](#testing-your-integration "Direct link to Testing Your Integration")

> **⚠️ Important**: webhook.site and ngrok are popular and free tools for webhook testing, but **GHL does not recommend using them for production applications**.

### 1\. Use a Webhook Testing Service[​](#1-use-a-webhook-testing-service "Direct link to 1. Use a Webhook Testing Service")

Start with [webhook.site](https://webhook.site):

1.  Go to webhook.site
2.  Copy the unique URL
3.  Use it as your webhook URL for testing
4.  Watch incoming webhooks in real-time

### 2\. Test Locally with ngrok[​](#2-test-locally-with-ngrok "Direct link to 2. Test Locally with ngrok")

```
# Install ngroknpm install -g ngrok# Start your local servernode app.js# In another terminal, expose your local serverngrok http 3000# Use the ngrok URL as your webhook URL# Example: https://abc123.ngrok.io/webhooks
```

### 3\. Test with Sample Data[​](#3-test-with-sample-data "Direct link to 3. Test with Sample Data")

```
// Test your webhook handler with sample dataconst testWebhook = {  type: 'ContactCreate',  timestamp: new Date().toISOString(),  webhookId: 'test-123',  data: {    id: 'contact_123',    firstName: 'John',    lastName: 'Doe',    email: 'john@example.com'  }}// Send test requestfetch('http://localhost:3000/webhooks', {  method: 'POST',  headers: { 'Content-Type': 'application/json' },  body: JSON.stringify(testWebhook)})
```

## Common Issues and Solutions[​](#common-issues-and-solutions "Direct link to Common Issues and Solutions")

### Issue: "Invalid signature" errors[​](#issue-invalid-signature-errors "Direct link to Issue: \"Invalid signature\" errors")

**Solution**: Make sure you're using the correct public key and verifying the entire payload.

### Issue: Duplicate webhook processing[​](#issue-duplicate-webhook-processing "Direct link to Issue: Duplicate webhook processing")

**Solution**: Store webhook IDs and check for duplicates before processing.

### Issue: Webhooks timing out[​](#issue-webhooks-timing-out "Direct link to Issue: Webhooks timing out")

**Solution**: Process webhooks asynchronously and respond quickly.

### Issue: Missing webhook events[​](#issue-missing-webhook-events "Direct link to Issue: Missing webhook events")

**Solution**: Check that you've subscribed to the correct events in your OAuth app.

### Issue: Can't access webhook data[​](#issue-cant-access-webhook-data "Direct link to Issue: Can't access webhook data")

**Solution**: Ensure your OAuth app has the correct scopes for the data you need.

## Next Steps[​](#next-steps "Direct link to Next Steps")

1.  **Set up your webhook endpoint** using one of the examples above
2.  **Test with webhook.site** to make sure it's working
3.  **Create your OAuth application** in our marketplace
4.  **Subscribe to the events** you need
5.  **Deploy your webhook handler** to a production server
6.  **Monitor and log** your webhook processing

## Need Help?[​](#need-help "Direct link to Need Help?")

*   **Community**: [Join our developer community for questions and support](https://developers.gohighlevel.com/join-dev-community)
*   **Support**: [Contact our developer support team for technical assistance](https://developers.gohighlevel.com/support)

* * *

_This guide is designed to help you get started with webhook integration. For advanced features and detailed API documentation, please refer to our complete API reference._

## Share your feedback

★★★★★
