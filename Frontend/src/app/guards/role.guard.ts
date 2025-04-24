import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRole = route.data['role'];
    const userRole = this.authService.getUserRole();

    if (!userRole) {
      this.router.navigate(['/login']);
      return false;
    }

    if (userRole === requiredRole) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
