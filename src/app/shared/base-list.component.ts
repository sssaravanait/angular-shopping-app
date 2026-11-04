import { DestroyRef, Directive, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';
import { TableFilterEvent, TableLazyLoadEvent, TablePageEvent } from 'primeng/table';

import { ApiError } from '../core/models/api-error.model';

interface ListPage<T> {
    items: readonly T[];
    totalRecords: number;
}

export interface ListQuery {
    page: number;
    perPage: number;
    sortField: string | undefined;
    sortOrder: 'asc' | 'desc' | undefined;
}

@Directive()
export abstract class BaseListComponent<T> implements OnInit {
    protected readonly destroyRef = inject(DestroyRef);

    protected readonly items = signal<T[]>([]);
    protected readonly totalRecords = signal(0);
    protected readonly first = signal(0);
    protected readonly pageSize = signal(10);
    protected readonly loading = signal(false);
    protected readonly error = signal<string | null>(null);
    protected readonly lazyLoadEvent = signal<TableLazyLoadEvent>({ first: 0, rows: 10 });

    ngOnInit(): void {
        this.loadData(this.lazyLoadEvent());
    }

    protected onLazyLoad(event: TableLazyLoadEvent): void {
        const first = event.first ?? this.first();
        const rows = event.rows ?? this.pageSize();

        this.first.set(first);
        this.pageSize.set(rows);
        this.lazyLoadEvent.update(current => ({ ...current, ...event, first, rows }));
        this.loadData(this.lazyLoadEvent());
    }

    protected onPageChange(event: TablePageEvent): void {
        this.onLazyLoad({ ...this.lazyLoadEvent(), first: event.first, rows: event.rows });
    }

    protected onSortChange(event: { field?: string; order: number }): void {
        this.onLazyLoad({
            ...this.lazyLoadEvent(),
            first: 0,
            sortField: event.field,
            sortOrder: event.order,
        });
    }

    protected onFilter(event: TableFilterEvent): void {
        this.onLazyLoad({ ...this.lazyLoadEvent(), first: 0, filters: event.filters });
    }

    protected reload(): void {
        this.loadData(this.lazyLoadEvent());
    }

    protected reloadAfterDelete(): void {
        if (this.items().length === 1 && this.first() > 0) {
            this.first.update(first => Math.max(0, first - this.pageSize()));
            this.lazyLoadEvent.update(event => ({ ...event, first: this.first() }));
        }

        this.reload();
    }

    protected getListQuery(event: TableLazyLoadEvent = this.lazyLoadEvent()): ListQuery {
        const first = event.first ?? this.first();
        const perPage = event.rows ?? this.pageSize();
        const sortField = typeof event.sortField === 'string' ? event.sortField : undefined;

        return {
            page: Math.floor(first / perPage) + 1,
            perPage,
            sortField,
            sortOrder: sortField && event.sortOrder
                ? (event.sortOrder === 1 ? 'asc' : 'desc')
                : undefined,
        };
    }

    protected loadPage<Response>(
        request: Observable<Response>,
        selectPage: (response: Response) => ListPage<T>,
    ): void {
        this.loading.set(true);
        this.error.set(null);

        request.pipe(
            finalize(() => this.loading.set(false)),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe({
            next: response => {
                const page = selectPage(response);
                this.items.set([...page.items]);
                this.totalRecords.set(page.totalRecords);
            },
            error: (err: ApiError) => this.error.set(err.message),
        });
    }

    protected abstract loadData(event?: TableLazyLoadEvent): void;
}
