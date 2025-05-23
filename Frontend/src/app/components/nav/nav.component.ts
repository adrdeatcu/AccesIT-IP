import { Component, Inject, PLATFORM_ID } from '@angular/core'; // Added Inject, PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // Added isPlatformBrowser
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Still used for role checks etc.
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpClient and HttpHeaders
import { filter, finalize } from 'rxjs/operators'; // Import finalize
import { of } from 'rxjs'; // Import of for catchError

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  standalone: false
})
export class NavComponent {
  hideNav = false;
  private apiUrl = 'http://localhost:3000/api'; // Backend API URL

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService, // Used for role checks, getHomeRoute
    private http: HttpClient, // Injected HttpClient
    @Inject(PLATFORM_ID) private platformId: Object // Injected PLATFORM_ID
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }
      // Ensure route.snapshot.data exists before accessing hideNav
      this.hideNav = !!(route.snapshot.data && route.snapshot.data['hideNav']); // This line reads the data
    });
  }

  isLoggedIn(): boolean {
    // Rely on AuthService or check localStorage directly if AuthService.isLoggedIn is not robust
    // For this example, let's assume AuthService.isLoggedIn checks the token existence
    if (isPlatformBrowser(this.platformId)) {
        return !!localStorage.getItem('token'); // Direct check
    }
    return false;
  }

  getUserRole(): string {
    return this.authService.getUserRole(); // Assumes AuthService can still provide this
  }

  getUserId(): string {
    return this.authService.getUserId(); // Assumes AuthService can still provide this
  }

  getHomeRoute(): string {
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

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');

      if (token) {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers })
          .pipe(
            finalize(() => {
              // This block executes whether the HTTP call succeeds or fails
              this.performClientSideLogoutCleanup();
            })
          )
          .subscribe({
            next: () => console.log('Successfully logged out from server.'),
            error: (err) => console.error('Error logging out from server:', err)
          });
      } else {
        // No token found, just clean up client-side
        this.performClientSideLogoutCleanup();
      }
    }
  }

  private performClientSideLogoutCleanup(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Performing client-side logout cleanup.');
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Assuming user info is stored under 'user'
      // Remove any other relevant items from localStorage
      // e.g., localStorage.removeItem('userRole');
      // localStorage.removeItem('userId');

      // If your AuthService uses a BehaviorSubject or similar for currentUser,
      // you might want to signal it here, though the prompt was to avoid AuthService for logout.
      // For instance, if AuthService had a method like clearUserStateInMemory():
      // this.authService.clearUserStateInMemory();
    }
    this.router.navigate(['/login']);
  }
}
