export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api',
  google: {
    clientId: 'YOUR_PRODUCTION_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    redirectUri: 'https://your-domain.com/auth/callback',
    scope: 'openid email profile',
    discoveryUrl: 'https://accounts.google.com/.well-known/openid_configuration'
  }
};
