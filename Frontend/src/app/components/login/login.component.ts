import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false
})
export class LoginComponent {
  loginData = {
    email: '',
    password: '',
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    console.log('→ Sending login payload:', this.loginData);
    this.http.post('http://localhost:3000/api/login', this.loginData)
      .subscribe({
        next: (response: any) => {
          // Log the token for debugging
          console.log('Received token:', response.token);
          

          // Store both token and user data
          localStorage.setItem('token', response.token);
          console.log('Token stored in localStorage:', localStorage.getItem('token'));
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Update AuthService state
          this.authService.setCurrentUser(response.user);
          
          // Role-based navigation
          const roleRoutes: { [key: string]: string } = {
            'Admin': '/admin-home',
            'HR': '/hr-home',
            'Portar': '/gate-home',
            'Normal': '/normal-home'
          };

          const redirectRoute = roleRoutes[response.user.rol] || '/login';
          this.router.navigate([redirectRoute]);
        },
        error: (error) => {
          console.error('Login error:', error);
          alert('Autentificare eșuată: ' + (error.error?.error || 'Eroare necunoscută'));
        }
      });
  }
}
