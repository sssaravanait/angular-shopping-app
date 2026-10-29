import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { Customer, CustomerPage, CustomerPayload } from '../models/customer.model';

export interface CustomerListQuery {
    page?: number;
    perPage?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
    status_code: number;
    message: string;
}

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

// Status-specific messages. Statuses not listed here fall back to the server message.
const ERROR_MESSAGES: Record<number, string> = {
    0: 'Cannot reach the server. Please check that the backend is running.',
    401: 'Your session has expired. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The customer was not found. It may have been deleted.',
    502: 'The server is temporarily unavailable. Please try again shortly.',
    503: 'The server is temporarily unavailable. Please try again shortly.',
    504: 'The server is temporarily unavailable. Please try again shortly.',
};

@Injectable({ providedIn: 'root' })
export class CustomerService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/customers/`;

    list({ page = 1, perPage = 10, sortField, sortOrder }: CustomerListQuery = {}): Observable<CustomerPage> {
        const params = new HttpParams({
            fromObject: {
                page,
                per_page: perPage,
                ...(sortField && sortOrder ? { sort_field: sortField, sort_order: sortOrder } : {}),
            },
        });

        return this.withErrorHandling(this.http.get<CustomerPage>(this.baseUrl, { params }));
    }

    getById(id: number): Observable<Customer> {
        return this.withErrorHandling(this.http.get<Customer>(this.itemUrl(id)));
    }

    create(payload: CustomerPayload): Observable<Customer> {
        return this.withErrorHandling(this.http.post<Customer>(this.baseUrl, payload));
    }

    update(id: number, payload: CustomerPayload): Observable<Customer> {
        return this.withErrorHandling(this.http.put<Customer>(this.itemUrl(id), payload));
    }

    delete(id: number): Observable<void> {
        return this.withErrorHandling(this.http.delete<void>(this.itemUrl(id)));
    }

    private itemUrl(id: number): string {
        return `${this.baseUrl}${id}/`;
    }

    /** Applies the same error mapping to every request in one place. */
    private withErrorHandling<T>(request: Observable<T>): Observable<T> {
        return request.pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.toApiError(error))
            )
        );
    }

    private toApiError(error: HttpErrorResponse): ApiError {
        const serverMessage: string | undefined = error.error?.detail ?? error.error?.message;

        return {
            status_code: error.status,
            message: ERROR_MESSAGES[error.status] ?? serverMessage ?? DEFAULT_ERROR_MESSAGE,
        };
    }
}