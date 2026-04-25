# Google OAuth2 Setup Guide

This guide will help you set up Google OAuth2 authentication for the Fitness Tracker application.

## Prerequisites

1. Google Cloud Console account
2. Google Cloud project created

## Step 1: Create Google OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
5. Select **Web application** as the application type
6. Configure the following:
   - **Name**: Fitness Tracker Web App
   - **Authorized JavaScript origins**: 
     - `http://localhost:4200` (for development)
     - `https://your-domain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:4200/auth/callback` (for development)
     - `https://your-domain.com/auth/callback` (for production)
7. Click **Create**
8. Copy the **Client ID** - you'll need this for the configuration

## Step 2: Enable Required APIs

1. In Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search and enable:
   - **Google+ API** (if available) or **People API**
   - **Google Identity Services API**

## Step 3: Update Environment Configuration

1. Open `src/environments/environment.ts`
2. Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api',
     google: {
       clientId: 'YOUR_ACTUAL_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
       redirectUri: 'http://localhost:4200/auth/callback',
       scope: 'openid email profile',
       discoveryUrl: 'https://accounts.google.com/.well-known/openid_configuration'
     }
   };
   ```

## Step 4: Backend Implementation

Your backend needs to handle the Google OAuth2 callback. Here's a sample implementation using Node.js/Express:

```javascript
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

app.post('/api/auth/google', async (req, res) => {
  try {
    const { code } = req.body;
    
    // Exchange authorization code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: 'http://localhost:4200/auth/callback',
      grant_type: 'authorization_code'
    });
    
    // Get user info from Google
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenResponse.data.access_token}`
      }
    });
    
    // Create or update user in your database
    const user = await findOrCreateUser(userInfoResponse.data);
    
    // Generate JWT token for your application
    const appToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token: appToken });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});
```

## Step 5: Environment Variables for Backend

Create a `.env` file in your backend project:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_key
```

## Step 6: Test the Implementation

1. Start your Angular application: `ng serve`
2. Start your backend server
3. Navigate to `http://localhost:4200`
4. Click "Continue with Google"
5. Complete the Google authentication flow
6. You should be redirected to the home screen upon successful authentication

## Security Considerations

1. **HTTPS Required**: In production, always use HTTPS
2. **Environment Variables**: Never commit sensitive credentials to version control
3. **Token Storage**: The app stores JWT tokens in HTTP-only cookies for security
4. **State Parameter**: The implementation includes a random state parameter to prevent CSRF attacks
5. **Token Validation**: Always validate JWT tokens on the server side

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" Error**
   - Ensure the redirect URI in Google Console matches exactly what's in your environment config
   - Check for trailing slashes or protocol differences (http vs https)

2. **"invalid_client" Error**
   - Verify your Client ID is correct
   - Ensure the application type is set to "Web application"

3. **Popup blocked by browser**
   - Modern browsers may block popups. Ensure your app is served over HTTPS in production
   - Consider implementing a redirect-based flow as an alternative

4. **CORS Issues**
   - Ensure your backend allows requests from your frontend domain
   - Configure CORS middleware properly

### Debug Mode

To enable debug mode, add logging to the AuthService:

```typescript
private async exchangeCodeForToken(code: string): Promise<void> {
  console.log('Exchanging code for token:', code);
  // ... rest of the method
}
```

## Production Deployment

1. Update `src/environments/environment.prod.ts` with production values
2. Use HTTPS for all endpoints
3. Set up proper domain verification in Google Console
4. Consider implementing refresh tokens for better user experience
5. Add proper error handling and user feedback

## Additional Features

You can extend the Google OAuth2 implementation with:

1. **Profile Picture Sync**: Store and display user's Google profile picture
2. **User Profile Updates**: Allow users to update additional profile information
3. **Social Sharing**: Integrate with other Google services
4. **Multi-factor Authentication**: Add additional security layers

## Support

For Google OAuth2 documentation:
- [Google Identity Platform](https://developers.google.com/identity)
- [OAuth2 Overview](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web/sign-in)
