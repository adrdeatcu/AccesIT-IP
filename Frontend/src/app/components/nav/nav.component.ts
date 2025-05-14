import { Component } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  standalone: false
})
export class NavComponent {
  hideNav = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {
    // Subscribe to router events to check route data
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }
      this.hideNav = route.snapshot.data['hideNav'] === true;
    });
  }

  isLoggedIn() {
    return this.getUserRole() !== '';
  }

  getUserRole(): string {
    return this.authService.getUserRole();
  }

  getUserId(): string {
    // Assuming AuthService stores the logged-in user ID somewhere,
    // e.g. in localStorage or in-memory after login.
    return this.authService.getUserId();
  }
  getHomeRoute() {
    if (this.authService.isAdmin()) {
      return '/admin-home';
    } else if (this.authService.isHR()) {
      return '/hr-home';
    } else if (this.authService.isPortar()) {
      return '/gate-home';
    } else if (this.authService.isNormal()) {
      return '/normal-home';
    }
    return '/login';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
