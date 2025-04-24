import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: false
})
export class LoginComponent {
  loginData = {
    nume_utilizator: '',
    parola: '',
    rol: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    if (!this.loginData.rol) {
      alert('Va rugam selectati un rol');
      return;
    }

    this.http.post('http://localhost:3000/api/login', this.loginData)
      .subscribe({
        next: (response: any) => {
          if (response.user.rol !== this.loginData.rol) {
            alert('Rolul selectat nu corespunde cu rolul utilizatorului');
            return;
          }
          this.authService.setCurrentUser(response.user);
          localStorage.setItem('token', response.token);
          
          // Redirect based on role
          switch(response.user.rol) {
            case 'Admin':
              this.router.navigate(['/admin-home']);  // Changed from admin-dashboard
              break;
            case 'HR':
              this.router.navigate(['/hr-home']);  // Matches route
              break;
            case 'Portar':
              this.router.navigate(['/gate-home']);  // Changed from gate-dashboard
              break;
            case 'Normal':
              this.router.navigate(['/normal-home']);  // Changed from user-dashboard
              break;
            default:
              this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('Login failed', error);
          alert(error.error.error || 'Login failed');
        }
      });
  }
}
