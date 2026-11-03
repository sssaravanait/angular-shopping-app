import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Pencil } from '@primeicons/angular/pencil';
import { Trash } from '@primeicons/angular/trash';
import { TableModule, TablePageEvent } from 'primeng/table';

import { ApiError } from '../../core/models/api-error.model';
import { Product, ProductCategory, PRODUCT_CATEGORIES } from './models/product.model';
import { ProductService } from './services/product.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonModule, DatePipe, TableModule, Pencil, Trash],
    selector: 'app-products',
    templateUrl: './products.html',
})
export class ProductsComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);
    private readonly productService = inject(ProductService);

    protected readonly products = signal<Product[]>([]);
    protected readonly totalRecords = signal(0);
    protected readonly first = signal(0);
    protected readonly pageSize = signal(10);
    protected readonly loading = signal(false);
    protected readonly error = signal<string | null>(null);

    private readonly sortField = signal<string | undefined>(undefined);
    private readonly sortOrder = signal<'asc' | 'desc' | undefined>(undefined);

    ngOnInit(): void {
        this.loadProducts();
    }

    protected onPageChange(event: TablePageEvent): void {
        this.first.set(event.first ?? 0);
        this.pageSize.set(event.rows ?? this.pageSize());
        this.loadProducts();
    }

    protected onSortChange(event: { field?: string; order: number }): void {
        const field = typeof event.field === 'string' ? event.field : undefined;

        this.first.set(0);
        this.sortField.set(field);
        this.sortOrder.set(field && event.order ? (event.order === 1 ? 'asc' : 'desc') : undefined);
        this.loadProducts();
    }

    protected reload(): void {
        this.loadProducts();
    }

    protected categoryLabel(category: ProductCategory): string {
        return PRODUCT_CATEGORIES.find(option => option.value === category)?.label ?? category;
    }

    protected createProduct(): void {
        this.router.navigate(['create'], { relativeTo: this.route });
    }

    protected editProduct(id: number): void {
        this.router.navigate([id, 'edit'], { relativeTo: this.route });
    }

    protected deleteProduct(id: number): void {
        this.loading.set(true);
        this.error.set(null);

        this.productService.delete(id)
            .pipe(
                finalize(() => this.loading.set(false)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: () => {
                    if (this.products().length === 1 && this.first() > 0) {
                        this.first.update(first => Math.max(0, first - this.pageSize()));
                    }
                    this.loadProducts();
                },
                error: (err: ApiError) => this.error.set(err.message),
            });
    }

    private loadProducts(): void {
        this.loading.set(true);
        this.error.set(null);

        this.productService.list({
            page: Math.floor(this.first() / this.pageSize()) + 1,
            perPage: this.pageSize(),
            sortField: this.sortField(),
            sortOrder: this.sortOrder(),
        })
            .pipe(
                finalize(() => this.loading.set(false)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: response => {
                    this.products.set(response.data);
                    this.totalRecords.set(response.total_items);
                },
                error: (err: ApiError) => this.error.set(err.message),
            });
    }
}
