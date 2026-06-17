/**
 * Financial Concierge – Runtime Configuration
 *
 * In production (Amplify), this file is generated during the preBuild phase
 * with real values from SSM Parameter Store and Amplify environment variables.
 *
 * For local development, replace the placeholder values below with your
 * actual Cognito User Pool ID and Client ID from the Terraform output:
 *   terraform output cognito_user_pool_id
 *   terraform output cognito_client_id
 *   terraform output api_endpoint
 */
window.APP_CONFIG = {
  API_BASE_URL: '',
  UPLOAD_PATH: '/api/upload-url',
  AWS_REGION: 'eu-central-1',
  COGNITO_USER_POOL_ID: '',
  COGNITO_CLIENT_ID: '',
  APP_NAME: 'Financial Concierge'
};
