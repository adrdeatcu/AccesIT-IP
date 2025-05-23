import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token'); // Directly check for the token

    if (token) {
      // User has a token, allow access
      // For enhanced security, you might want to decode the token here
      // and check if it's expired or still valid.
      return true;
    } else {
      // No token found, user is not authenticated
      console.log('AuthGuard (functional): No token found, redirecting to login.');
      // Redirect to the login page, passing the attempted URL as a returnUrl query parameter
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }

  // If not in a browser environment (e.g., during SSR build),
  // or if the platform check somehow fails, deny access.
  // You might have different logic for SSR.
  if (!isPlatformBrowser(platformId)) {
      console.warn('AuthGuard (functional): Not in a browser environment. Access denied by default for route:', state.url);
  }
  // Fallback: if not a browser or token check was inconclusive for some reason, redirect to login.
  // This ensures that if the code reaches here, it defaults to a secure state.
  router.navigate(['/login']);
  return false;
};
