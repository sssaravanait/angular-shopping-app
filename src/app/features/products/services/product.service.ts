import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Product, ProductPage, ProductPayload } from '../models/product.model';

export interface ProductListQuery {
    page?: number;
    perPage?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/products/`;

    list({ page = 1, perPage = 10, sortField, sortOrder }: ProductListQuery = {}): Observable<ProductPage> {
        const params = new HttpParams({
            fromObject: {
                page: String(page),
                per_page: String(perPage),
                ...(sortField && sortOrder ? { sort_field: sortField, sort_order: sortOrder } : {}),
            },
        });

        return this.http.get<ProductPage>(this.baseUrl, { params });
    }

    getById(id: number): Observable<Product> {
        return this.http.get<Product>(this.itemUrl(id));
    }

    create(payload: ProductPayload): Observable<Product> {
        return this.http.post<Product>(this.baseUrl, payload);
    }

    update(id: number, payload: ProductPayload): Observable<Product> {
        return this.http.put<Product>(this.itemUrl(id), payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(this.itemUrl(id));
    }

    private itemUrl(id: number): string {
        return `${this.baseUrl}${id}/`;
    }
}
