import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Customer, CustomerPage, CustomerPayload } from '../models/customer.model';

export interface CustomerListQuery {
    page?: number;
    perPage?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Data access for the /customers endpoints.
 * Errors are normalized to the app-wide `ApiError` by the global
 * httpErrorInterceptor, so this service only makes typed HTTP calls.
 */
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

        return this.http.get<CustomerPage>(this.baseUrl, { params });
    }

    getById(id: number): Observable<Customer> {
        return this.http.get<Customer>(this.itemUrl(id));
    }

    create(payload: CustomerPayload): Observable<Customer> {
        return this.http.post<Customer>(this.baseUrl, payload);
    }

    update(id: number, payload: CustomerPayload): Observable<Customer> {
        return this.http.put<Customer>(this.itemUrl(id), payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(this.itemUrl(id));
    }

    private itemUrl(id: number): string {
        return `${this.baseUrl}${id}/`;
    }
}
