import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        try {
          const parsedUser = JSON.parse(user);
          this.currentUserSubject.next(parsedUser);
        } catch {
          // If JSON parsing fails, clear everything
          this.logout();
        }
      } else {
        // If either token or user is missing, clear everything
        this.logout();
      }
    }
  }

  setCurrentUser(user: any) {
    if (!user) {
      this.logout();
      return;
    }
    this.currentUserSubject.next(user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  logout() {
    this.currentUserSubject.next(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  getUserRole(): string {
    const user = this.currentUserSubject.value;
    return user ? user.rol : '';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'Admin';
  }

  isHR(): boolean {
    return this.getUserRole() === 'HR';
  }

  isPortar(): boolean {
    return this.getUserRole() === 'Portar';
  }

  isNormal(): boolean {
    return this.getUserRole() === 'Normal';
  }
}