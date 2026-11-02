// core/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
    const router = inject(Router);

    return inject(AuthService)
        .checkSession()
        .pipe(
            map(
                (isAuthenticated) =>
                    isAuthenticated ||
                    router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }),
            ),
        );
};