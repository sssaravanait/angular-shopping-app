import { HttpErrorResponse } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { NonNullableFormBuilder } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ADMIN_DASHBOARD_URL } from '../../../core/routes/admin-routes';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    imports: [InputTextModule, ButtonModule, ReactiveFormsModule],
    selector: 'app-login',
    styleUrl: './login.css',
    templateUrl: './login.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    readonly loading = signal(false);
    readonly errorMessage = signal<string | null>(null);

    readonly form = inject(NonNullableFormBuilder).group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required]],
    });

    isInvalid(field: 'username' | 'password'): boolean {
        const control = this.form.controls[field];
        return control.invalid && control.touched;
    }

    submit(): void {
        if (this.loading()) return;

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.errorMessage.set(null);

        this.auth
            .login(this.form.getRawValue())
            .pipe(
                finalize(() => this.loading.set(false)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: () => void this.router.navigateByUrl(ADMIN_DASHBOARD_URL),
                error: (err: HttpErrorResponse) => this.errorMessage.set(this.toErrorMessage(err)),
            });
    }

    private toErrorMessage(err: HttpErrorResponse): string {
        switch (err.status) {
            case 0:
                return 'Unable to reach the server. Check your connection and try again.';
            case 400:
            case 401:
                return 'Invalid username or password.';
            case 403:
                return 'Your session could not be verified. Please try again.';
            case 429:
                return 'Too many login attempts. Please wait a moment and try again.';
            default:
                return 'Something went wrong. Please try again later.';
        }
    }
}
