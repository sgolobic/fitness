import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly GOOGLE_CONFIG = environment.google;
  private authState$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus();
  }

  async login(email: string, password: string): Promise<void> {
    try {
      // Check if mock authentication is enabled
      if (environment.mockAuth) {
        return this.mockLogin(email, password);
      }
      
      const response = await this.http.post<any>(`${this.API_URL}/auth/login`, {
        email,
        password
      }).toPromise();
      
      if (response?.token) {
        this.setToken(response.token);
        this.authState$.next(true);
      }
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  private async mockLogin(email: string, password: string): Promise<void> {
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple mock validation (accept any non-empty email/password)
    if (!email || !password) {
      throw new Error('Please enter both email and password');
    }
    
    // Create mock JWT token
    const mockToken = this.createMockJWT({
      userId: 'mock-user-456',
      email: email,
      name: email.split('@')[0], // Use email username as name
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours from now
    });
    
    this.setToken(mockToken);
    this.authState$.next(true);
  }

  async loginWithGoogle(): Promise<void> {
    try {
      // Check if mock authentication is enabled
      if (environment.mockAuth) {
        return this.mockGoogleAuth();
      }
      
      // Generate Google OAuth2 URL
      const authUrl = this.buildGoogleAuthUrl();
      
      // Open Google OAuth in popup
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600,scrollbars=yes,resizable=yes');
      
      // Handle popup response
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);

        const messageHandler = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            popup?.close();
            
            try {
              await this.exchangeCodeForToken(event.data.code);
              resolve();
            } catch (error) {
              reject(error);
            }
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            popup?.close();
            reject(new Error(event.data.error || 'Authentication failed'));
          }
        };

        window.addEventListener('message', messageHandler);
      });
    } catch (error) {
      throw new Error('Google login failed');
    }
  }

  private async mockGoogleAuth(): Promise<void> {
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create mock JWT token
    const mockToken = this.createMockJWT({
      userId: 'mock-user-123',
      email: 'mockuser@example.com',
      name: 'Mock User',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours from now
    });
    
    this.setToken(mockToken);
    this.authState$.next(true);
  }

  private createMockJWT(payload: any): string {
    // Create a mock JWT token (for development only)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = btoa('mock-signature');
    
    return `${header}.${body}.${signature}`;
  }

  private buildGoogleAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.GOOGLE_CONFIG.clientId,
      redirect_uri: this.GOOGLE_CONFIG.redirectUri,
      scope: this.GOOGLE_CONFIG.scope,
      response_type: 'code',
      state: this.generateState(),
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async exchangeCodeForToken(code: string): Promise<void> {
    try {
      const response = await this.http.post<any>(`${this.API_URL}/auth/google`, { code }).toPromise();
      
      if (response?.token) {
        this.setToken(response.token);
        this.authState$.next(true);
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      throw new Error('Failed to exchange code for token');
    }
  }

  private checkAuthStatus(): void {
    const isAuth = this.isAuthenticated();
    this.authState$.next(isAuth);
  }

  getAuthState(): Observable<boolean> {
    return this.authState$.asObservable();
  }

  logout(): void {
    this.removeToken();
    this.authState$.next(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  private setToken(token: string): void {
    document.cookie = `auth_token=${token}; path=/; secure; samesite=strict`;
  }

  private getToken(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        return value;
      }
    }
    return null;
  }

  private removeToken(): void {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }
}
