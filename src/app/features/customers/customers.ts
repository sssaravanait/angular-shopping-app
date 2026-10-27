import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { environment } from '../../../environments/environment';

interface Customer {
    readonly id: number;
    readonly first_name: string;
    readonly last_name: string;
    readonly email: string;
    readonly phone: string;
    readonly dob: string;
    readonly created_at: string;
    readonly updated_at: string;
}

interface CustomerPage {
    readonly data: Customer[];
    readonly total: number;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonModule, TableModule],
    selector: 'app-customers',
    templateUrl: './customers.html',
    styleUrl: './customers.css',
})
export class CustomerComponent {
    private readonly http = inject(HttpClient);

    protected readonly customers = signal<Customer[]>([]);
    protected readonly totalRecords = signal(0);
    protected readonly first = signal(0);
    protected readonly pageSize = signal(10);
    protected readonly loading = signal(false);
    protected readonly error = signal<string | null>(null);

    private readonly sortField = signal<string | undefined>(undefined);
    private readonly sortOrder = signal<'asc' | 'desc' | undefined>(undefined);

    protected onLazyLoad(event: TableLazyLoadEvent): void {
        const first = event.first ?? 0;
        const rows = event.rows ?? this.pageSize();
        const field = typeof event.sortField === 'string' ? event.sortField : undefined;

        this.first.set(first);
        this.pageSize.set(rows);
        this.sortField.set(field);
        this.sortOrder.set(field && event.sortOrder ? (event.sortOrder === 1 ? 'asc' : 'desc') : undefined);
        this.loadCustomers();
    }

    protected reload(): void {
        this.loadCustomers();
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

        this.http.get<CustomerPage>(`${environment.apiUrl}/customers`, { params })
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
            next: (response) => {
                this.customers.set(response.data);
                this.totalRecords.set(response.total);
            },
            error: () => this.error.set('Unable to load customers. Please try again.'),
        });
    }
}