import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  errorMessage = '';
  private authSubscription: Subscription | null = null;
  readonly isMockMode = environment.mockAuth;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Check if user is already authenticated
    this.authSubscription = this.authService.getAuthState().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async loginWithGoogle() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.authService.loginWithGoogle();
      // Navigation will be handled by the auth state subscription
    } catch (error) {
      this.errorMessage = 'Google login failed. Please try again.';
      console.error('Google login failed:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
