// core/auth/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, map, tap } from 'rxjs/operators';
import { AUTH_ENDPOINTS } from './auth.routes';
import { LoginCredentials, User } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);

    // In-memory state only. The session itself lives in an HttpOnly cookie.
    private readonly userSubject = new BehaviorSubject<User | null>(null);
    private csrfToken: string | null = null;

    readonly user$ = this.userSubject.asObservable();
    readonly isAuthenticated$ = this.user$.pipe(
        map((user) => user !== null),
        distinctUntilChanged(),
    );

    get isAuthenticated(): boolean {
        return this.userSubject.value !== null;
    }

    login(credentials: LoginCredentials): Observable<User> {
        return this.http.post<User>(AUTH_ENDPOINTS.login, credentials).pipe(
            tap((user) => {
                this.csrfToken = null;
                this.userSubject.next(user);
            }),
        );
    }

    /** Always clears local state, even if the server call fails. */
    logout(): Observable<void> {
        return this.http.post<void>(AUTH_ENDPOINTS.logout, {}).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.clearSession()),
        );
    }

    /** Resolves whether a valid session exists, restoring state after a page reload. */
    checkSession(): Observable<boolean> {
        if (this.isAuthenticated) {
            return of(true);
        }
        return this.http.get<User>(AUTH_ENDPOINTS.me).pipe(
            tap((user) => this.userSubject.next(user)),
            map(() => true),
            catchError(() => of(false)),
        );
    }

    clearSession(): void {
        this.csrfToken = null;
        this.userSubject.next(null);
    }

    getCsrfToken(): Observable<string> {
        return this.csrfToken ? of(this.csrfToken) : this.refreshCsrfToken();
    }

    refreshCsrfToken(): Observable<string> {
        this.csrfToken = null;
        return this.http.get<{ csrfToken: string }>(AUTH_ENDPOINTS.csrf).pipe(
            map((res) => res.csrfToken),
            tap((token) => (this.csrfToken = token)),
        );
    }
}