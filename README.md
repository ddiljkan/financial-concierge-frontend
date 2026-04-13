# Financial Concierge Website

This package contains only the static website for deployment to Amazon S3 static hosting or AWS Amplify Hosting.

## Files
- `index.html` — complete static frontend
- `config.js` — browser-readable configuration values

## How configuration works
The website loads values from `config.js` through `window.APP_CONFIG`.
This is useful for values such as:
- API Gateway base URL
- upload route path
- AWS region
- app name

## Important
Do not store secrets in `config.js`.
Anything inside this file is public and visible in the browser.
Only place non-sensitive frontend configuration there.

## Example
```js
window.APP_CONFIG = {
  API_BASE_URL: 'https://abc123.execute-api.eu-central-1.amazonaws.com',
  UPLOAD_PATH: '/upload-url',
  AWS_REGION: 'eu-central-1',
  APP_NAME: 'Financial Concierge'
};
```

## Deployment
### S3
Upload both `index.html` and `config.js` to your website bucket.

### Amplify
Commit both files to your frontend repository and deploy normally.

## Current behavior
- The page validates file types in the browser.
- The page reads runtime-like configuration from `config.js`.
- Once your Lambda/API is ready, update `config.js` and redeploy.