import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Pencil } from '@primeicons/angular/pencil';
import { Trash } from '@primeicons/angular/trash';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

import { ApiError } from '../../core/models/api-error.model';
import { Customer } from './models/customer.model';
import { CustomerService } from './services/customer.service';
import { BaseListComponent } from '../../shared/base-list.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonModule, DatePipe, TableModule, Pencil, Trash],
    selector: 'app-customers',
    templateUrl: './customers.html',
    styleUrl: './customers.css',
})
export class CustomerComponent extends BaseListComponent<Customer> {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly customerService = inject(CustomerService);

    protected createCustomer(): void {
        this.router.navigate(['create'], { relativeTo: this.route });
    }

    protected editCustomer(id: number): void {
        this.router.navigate([id, 'edit'], { relativeTo: this.route });
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
                next: () => {
                    this.reloadAfterDelete();
                },
                error: (err: ApiError) => this.error.set(err.message),
            });
    }

    protected loadData(event?: TableLazyLoadEvent): void {
        this.loadPage(
            this.customerService.list(this.getListQuery(event)),
            response => ({ items: response.data, totalRecords: response.total_items }),
        );
    }
}