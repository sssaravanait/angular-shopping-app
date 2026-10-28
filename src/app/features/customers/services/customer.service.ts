import { inject, Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";

import { environment } from "../../../../environments/environment";
import { Customer, CustomerPage, CustomerPayload } from "../models/customer.model";

@Injectable({ providedIn: 'root' })
export class CustomerService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/customers/`;

    list(page: number = 1, perPage: number = 10, sortBy: string = 'id', sortDir: string = 'desc'): Observable<CustomerPage> {
        const params = new HttpParams()
            .set('page', page)
            .set('per_age', perPage)
            .set('sort_by', sortBy)
            .set('sort_dir', sortDir);

        return this.http.get<CustomerPage>(this.baseUrl, { params });
    }

    getById(id: number): Observable<Customer> {
        return this.http.get<Customer>(`${this.baseUrl}${id}/`);
    }

    create(payload: CustomerPayload): Observable<Customer> {
        return this.http.post<Customer>(`${this.baseUrl}`, payload);
    }

    update(id: number, payload: CustomerPayload): Observable<Customer> {
        return this.http.put<Customer>(`${this.baseUrl}${id}/`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}${id}/`);
    }
}