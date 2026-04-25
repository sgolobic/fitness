export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  mockAuth: true, // Enable mock authentication for development
  google: {
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    redirectUri: 'http://localhost:4200/auth/callback',
    scope: 'openid email profile',
    discoveryUrl: 'https://accounts.google.com/.well-known/openid_configuration'
  }
};
