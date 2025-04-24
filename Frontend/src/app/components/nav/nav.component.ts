
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
  standalone: false
})
export class NavComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isLoggedIn(): boolean {
    return !!(this.authService.getUserRole() && localStorage.getItem('token'));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
