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
        return this.http.post<Product>(this.baseUrl, this.toFormData(payload));
    }

    update(id: number, payload: ProductPayload): Observable<Product> {
        return this.http.put<Product>(this.itemUrl(id), this.toFormData(payload));
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(this.itemUrl(id));
    }

    private itemUrl(id: number): string {
        return `${this.baseUrl}${id}/`;
    }

    private toFormData(payload: ProductPayload): FormData {
        const formData = new FormData();
        formData.append('name', payload.name);
        formData.append('category', payload.category);
        formData.append('sku', payload.sku);
        formData.append('price', payload.price);
        formData.append('stock_quantity', String(payload.stock_quantity));
        formData.append('is_active', String(payload.is_active));
        formData.append('description', payload.description);

        for (const image of payload.product_images) {
            formData.append('product_images', image, image.name);
        }

        formData.append('deleted_product_image_ids', JSON.stringify(payload.deleted_product_image_ids));
        return formData;
    }
}
