# Financial Concierge Website

This package contains only the static website for deployment to Amazon S3 static hosting or AWS Amplify Hosting.

## Files
- `index.html` — complete static frontend

## Configuration
In `index.html`, update the config block when your backend is ready:
- `apiBaseUrl` — your API Gateway base URL
- `uploadPath` — your route for generating presigned URLs

## Accepted uploads
- PDF
- PNG
- JPG / JPEG

## Deployment
### S3
Upload `index.html` to your website bucket and set it as the index document.

### Amplify
Deploy the folder as a static app. No build process is required.

## Current behavior
- The page validates file types in the browser.
- The page is prepared for direct S3 uploads via presigned URLs.
- Once your Lambda/API is ready, only the config block needs to be updated.
