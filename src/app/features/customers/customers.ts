import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Pencil } from '@primeicons/angular/pencil';
import { Trash } from '@primeicons/angular/trash';
import { TableLazyLoadEvent, TableModule, TablePageEvent } from 'primeng/table';
import { environment } from '../../../environments/environment';

import { Customer, CustomerPage } from './models/customer.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonModule, DatePipe, TableModule, Pencil, Trash],
    selector: 'app-customers',
    templateUrl: './customers.html',
    styleUrl: './customers.css',
})
export class CustomerComponent implements OnInit {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    protected readonly customers = signal<Customer[]>([]);
    protected readonly totalRecords = signal(0);
    protected readonly first = signal(0);
    protected readonly pageSize = signal(10);
    protected readonly loading = signal(false);
    protected readonly error = signal<string | null>(null);

    private readonly sortField = signal<string | undefined>(undefined);
    private readonly sortOrder = signal<'asc' | 'desc' | undefined>(undefined);

    ngOnInit(): void {
        this.loadCustomers();
    }

    protected onPageChange(event: TablePageEvent): void {
        const first = event.first ?? 0;
        const rows = event.rows ?? this.pageSize();

        this.first.set(first);
        this.pageSize.set(rows);
        this.loadCustomers();
    }

    protected onSortChange(event: TableLazyLoadEvent): void {
        const field = typeof event.sortField === 'string' ? event.sortField : undefined;

        this.first.set(0);
        this.sortField.set(field);
        this.sortOrder.set(field && event.sortOrder ? (event.sortOrder === 1 ? 'asc' : 'desc') : undefined);
        this.loadCustomers();
    }

    protected reload(): void {
        this.loadCustomers();
    }

    protected createCustomer(): void {
        this.router.navigate(['/customers/create']);
    }

    protected editCustomer(id: number): void {
        this.router.navigate(['/customers', id, 'edit']);
    }

    private loadCustomers(): void {
        let params = new HttpParams()
            .set('page', String(Math.floor(this.first() / this.pageSize()) + 1))
            .set('per_page', String(this.pageSize()));

        if (this.sortField() && this.sortOrder()) {
            params = params
                .set('sort_field', this.sortField()!)
                .set('sort_order', this.sortOrder()!);
        }

        this.loading.set(true);
        this.error.set(null);

        this.http.get<CustomerPage>(`${environment.apiUrl}/customers/`, { params })
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
            next: (response) => {
                this.customers.set(response.data);
                this.totalRecords.set(response.total_items);
            },
            error: () => this.error.set('Unable to load customers. Please try again.'),
        });
    }
}