// core/auth/auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { API_BASE, AUTH_ENDPOINTS } from './auth.routes';
import { AuthService } from './auth.service';
import { ADMIN_LOGIN_URL } from '../routes/admin-routes';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const AUTH_URLS = new Set<string>(Object.values(AUTH_ENDPOINTS));

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    if (!req.url.startsWith(API_BASE)) {
        return next(req);
    }

    const auth = inject(AuthService);
    const router = inject(Router);

    const needsCsrf = !SAFE_METHODS.has(req.method) && req.url !== AUTH_ENDPOINTS.csrf;

    const sendWithCsrf = (token: string): Observable<any> =>
        next(req.clone({ withCredentials: true, setHeaders: { 'X-CSRFToken': token } }));

    const request$ = needsCsrf
        ? auth.getCsrfToken().pipe(switchMap(sendWithCsrf))
        : next(req.clone({ withCredentials: true }));

    return request$.pipe(
        catchError((err: HttpErrorResponse) => {
            // 403 on an unsafe request usually means a stale CSRF token.
            // Refresh it and retry once. The retry is not wrapped in catchError again, so no loop.
            if (err.status === 403 && needsCsrf) {
                return auth.refreshCsrfToken().pipe(switchMap(sendWithCsrf));
            }

            // Session expired or invalid. Auth endpoints are excluded so that
            // /me (guard probe) and /login (bad credentials) do not redirect.
            if (err.status === 401 && !AUTH_URLS.has(req.url)) {
                auth.clearSession();
                router.navigate([ADMIN_LOGIN_URL], { queryParams: { returnUrl: router.url } });
            }

            return throwError(() => err);
        }),
    );
};