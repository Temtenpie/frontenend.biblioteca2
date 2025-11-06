import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'];
  const currentUser = authService.getCurrentUser();

  if (currentUser && currentUser.role === requiredRole) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};