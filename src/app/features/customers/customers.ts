import { ChangeDetectionStrategy, Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Pencil } from '@primeicons/angular/pencil';
import { Trash } from '@primeicons/angular/trash';
import { TableLazyLoadEvent, TableModule, TablePageEvent } from 'primeng/table';

import { ApiError } from '../../core/models/api-error.model';
import { Customer } from './models/customer.model';
import { CustomerService } from './services/customer.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonModule, DatePipe, TableModule, Pencil, Trash],
    selector: 'app-customers',
    templateUrl: './customers.html',
    styleUrl: './customers.css',
})
export class CustomerComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    private readonly customerService = inject(CustomerService);

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

    protected deleteCustomer(id: number): void {

        this.loading.set(true);
        this.error.set(null);

        this.customerService.delete(id)
            .pipe(
                finalize(() => this.loading.set(false)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (response) => {
                    // If this was the last row on a page after the first, go back one page
                    if (this.customers().length === 1 && this.first() > 0) {
                        this.first.update(f => Math.max(0, f - this.pageSize()));
                    }

                    this.loadCustomers();
                },
                error: (err: ApiError) => this.error.set(err.message),
            });
    }

    private loadCustomers(): void {

        this.loading.set(true);
        this.error.set(null);

        this.customerService.list({
            page: Number(Math.floor(this.first() / this.pageSize()) + 1), 
            perPage: Number(this.pageSize()), 
            sortField: this.sortField(), 
            sortOrder: this.sortOrder()
        })
            .pipe(
                finalize(() => this.loading.set(false)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (response) => {
                    this.customers.set(response.data);
                    this.totalRecords.set(response.total_items);
                },
                error: (err: ApiError) => this.error.set(err.message),
            });
    }
}