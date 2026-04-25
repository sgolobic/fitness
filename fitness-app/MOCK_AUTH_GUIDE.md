# Mock Authentication Development Guide

This guide explains how to use the mock authentication feature for development and testing.

## Overview

The mock authentication feature allows you to test the complete authentication flow without needing:
- Google OAuth2 credentials
- Backend API server
- Real user accounts

## How Mock Authentication Works

### Environment Configuration

Mock authentication is controlled by the `mockAuth` flag in your environment file:

```typescript
// src/environments/environment.ts
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
```

### Mock Features

#### Google OAuth2 Mock
- **Button Text**: Shows "🧪 Mock Google Login" instead of "Continue with Google"
- **Flow**: Simulates the OAuth2 flow with a 1.5 second delay
- **User Data**: Creates mock user with email `mockuser@example.com`
- **Token**: Generates a mock JWT token for 24 hours

#### Email/Password Mock
- **Validation**: Accepts any non-empty email and password
- **Flow**: Simulates API call with 1 second delay
- **User Data**: Uses the provided email to create user data
- **Token**: Generates a mock JWT token for 24 hours

#### Visual Indicators
- **Mock Badge**: Shows "🧪 Development Mode - Mock Authentication" in header
- **Hints**: Displays helpful hints under form fields
- **Button Changes**: Clear indication of mock mode

## Using Mock Authentication

### 1. Start the Application
```bash
ng serve
```

### 2. Test Google OAuth2
- Click "🧪 Mock Google Login"
- Wait 1.5 seconds for "authenticating..."
- Automatically redirect to home screen

### 3. Test Email/Password
- Enter any email (e.g., `test@example.com`)
- Enter any password (e.g., `password123`)
- Click "Sign In"
- Wait 1 second for "authenticating..."
- Automatically redirect to home screen

### 4. Test Logout
- Click "Logout" in the home screen
- Redirect back to login screen
- Mock token is cleared

## Mock Token Structure

The mock JWT tokens have this structure:

```json
{
  "userId": "mock-user-123", // or "mock-user-456" for email login
  "email": "mockuser@example.com", // or provided email
  "name": "Mock User", // or email username
  "exp": 1234567890 // 24 hours from creation
}
```

## Switching Between Mock and Real Authentication

### Enable Mock Mode
```typescript
// src/environments/environment.ts
mockAuth: true
```

### Disable Mock Mode
```typescript
// src/environments/environment.ts
mockAuth: false
```

### Production Environment
The production environment automatically disables mock authentication:

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  // mockAuth is not set, defaults to false
  // ...
};
```

## Development Workflow

### 1. Feature Development
- Keep `mockAuth: true` for UI development
- Test authentication flows without backend
- Verify error handling and loading states

### 2. Integration Testing
- Set `mockAuth: false`
- Test with real backend API
- Verify Google OAuth2 integration

### 3. Production Deployment
- Use `environment.prod.ts`
- Mock authentication automatically disabled
- Real authentication required

## Troubleshooting

### Mock Authentication Not Working
1. Check that `mockAuth: true` is set in `environment.ts`
2. Restart the application after changing environment settings
3. Check browser console for errors

### Still Redirecting to Real Google
1. Verify the environment file is being used correctly
2. Check that you're not using `environment.prod.ts`
3. Clear browser cache and restart

### Token Issues
1. Mock tokens are stored in HTTP-only cookies
2. Check browser developer tools for cookies named `auth_token`
3. Tokens expire after 24 hours

## Best Practices

### Development
- Use mock authentication for UI development
- Test both Google and email/password flows
- Verify error handling with invalid inputs

### Testing
- Test with various email formats
- Test empty field validation
- Test logout functionality
- Test session persistence

### Before Production
- Set `mockAuth: false` in development environment
- Test with real backend API
- Verify Google OAuth2 credentials work

## Security Notes

⚠️ **IMPORTANT**: Mock authentication should NEVER be enabled in production!

- Mock tokens are not cryptographically signed
- No real user validation occurs
- Anyone can "authenticate" with any credentials
- Only for development and testing purposes

## Advanced Usage

### Custom Mock Data
You can modify the mock authentication methods in `AuthService`:

```typescript
private async mockGoogleAuth(): Promise<void> {
  // Customize mock user data
  const mockToken = this.createMockJWT({
    userId: 'custom-user-id',
    email: 'custom@example.com',
    name: 'Custom User',
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  });
  
  this.setToken(mockToken);
  this.authState$.next(true);
}
```

### Mock Delays
Adjust the authentication delays to simulate different network conditions:

```typescript
// Faster mock (for testing)
await new Promise(resolve => setTimeout(resolve, 100));

// Slower mock (for testing loading states)
await new Promise(resolve => setTimeout(resolve, 3000));
```

## Next Steps

Once you're ready to implement real authentication:

1. Set up Google OAuth2 credentials following `GOOGLE_OAUTH2_SETUP.md`
2. Set `mockAuth: false` in environment
3. Implement backend authentication endpoints
4. Test with real Google OAuth2 flow

## Support

If you encounter issues with mock authentication:

1. Check the browser console for JavaScript errors
2. Verify the environment configuration
3. Ensure the AuthService is properly imported
4. Check that the application is running on the expected port (4200)
