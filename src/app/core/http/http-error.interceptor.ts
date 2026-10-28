import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/api-error.model';
import { NotificationService } from '../services/notification.service';

const DEFAULT_MESSAGES: Record<number, string> = {
    400: 'The request was invalid.',
    401: 'Your session has expired. Please log in again.',
    403: 'You do not have permission to do this.',
    404: 'The requested record was not found.',
    409: 'This record conflicts with existing data.',
    422: 'Please correct the highlighted fields.',
    500: 'A server error occurred. Please try again later.',
};

/** Converts any thrown value into an ApiError. */
export function toApiError(error: unknown): ApiError {
    if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
            return { status: 0, message: 'Cannot reach the server. Check your connection.' };
        }

        // Expected backend body: { message: string, errors?: { field: message } }
        const body = error.error as { message?: string; errors?: Record<string, string> } | null;

        return {
            status: error.status,
            message: body?.message ?? DEFAULT_MESSAGES[error.status] ?? 'An unexpected error occurred.',
            fieldErrors: body?.errors,
        };
    }
    return { status: 0, message: 'An unexpected error occurred.' };
}

/**
 * Global HTTP interceptor. Runs on every request.
 * - Network and 5xx errors: shown as a toast here, once, for every screen.
 * - 4xx errors: passed to the component, which knows how to show them
 *   (for example, next to the correct form field).
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const notify = inject(NotificationService);

    return next(req).pipe(
        catchError((error: unknown) => {
            const apiError = toApiError(error);

            if (apiError.status === 0 || apiError.status >= 500) {
                notify.error(apiError.message);
            }

            return throwError(() => apiError);
        }),
    );
};