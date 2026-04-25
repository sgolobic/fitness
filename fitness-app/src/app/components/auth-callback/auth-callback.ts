import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  imports: [],
  templateUrl: './auth-callback.html',
  styleUrl: './auth-callback.scss'
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.handleCallback();
  }

  private handleCallback(): void {
    const fragment = this.route.snapshot.fragment;
    
    if (fragment) {
      const params = new URLSearchParams(fragment);
      const code = params.get('code');
      const error = params.get('error');
      
      if (code) {
        // Send success message to parent window
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          code: code
        }, window.location.origin);
        
        window.close();
      } else if (error) {
        // Send error message to parent window
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error
        }, window.location.origin);
        
        window.close();
      }
    } else {
      // Handle error case
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: 'No authorization code received'
      }, window.location.origin);
      
      window.close();
    }
  }
}
