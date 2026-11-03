import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { ApiError } from '../../../core/models/api-error.model';
import { NotificationService } from '../../../core/services/notification.service';
import { MAX_STOCK_QUANTITY, ProductCategory, ProductPayload, PRODUCT_CATEGORIES } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { notBlankValidator, positiveIntegerValidator } from '../utils/product.validator';

type FormField = 'name' | 'category' | 'sku' | 'price' | 'stock_quantity';

@Component({
    selector: 'app-product-form',
    imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule],
    templateUrl: './product-form.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductForm implements OnInit {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly productService = inject(ProductService);
    private readonly notifyService = inject(NotificationService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    readonly id = input<number | undefined, unknown>(undefined, {
        transform: value => value == null ? undefined : Number(value),
    });

    protected readonly categories = PRODUCT_CATEGORIES;
    protected readonly isEditMode = computed(() => this.id() !== undefined);
    protected readonly title = computed(() => this.isEditMode() ? 'Edit product' : 'Create product');
    protected readonly isLoading = signal(false);
    protected readonly isSubmitting = signal(false);

    protected readonly form = this.fb.group({
        name: ['', [Validators.required, notBlankValidator, Validators.maxLength(100)]],
        category: ['others' as ProductCategory, Validators.required],
        sku: ['', [Validators.required, notBlankValidator, Validators.maxLength(64)]],
        price: ['', [Validators.required, Validators.pattern(/^\d{1,8}(\.\d{1,2})?$/)]],
        stock_quantity: [0, [
            Validators.required,
            Validators.min(0),
            Validators.max(MAX_STOCK_QUANTITY),
            positiveIntegerValidator,
        ]],
        is_active: [true],
    });

    ngOnInit(): void {
        const id = this.id();
        if (id !== undefined) {
            this.loadProduct(id);
        }
    }

    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const payload = this.toPayload();
        const id = this.id();
        const request$ = id !== undefined
            ? this.productService.update(id, payload)
            : this.productService.create(payload);

        this.isSubmitting.set(true);
        request$.pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.isSubmitting.set(false)),
        ).subscribe({
            next: () => {
                this.notifyService.success(this.isEditMode() ? 'Product updated successfully.' : 'Product created successfully.');
                this.router.navigate(['/products']);
            },
            error: (err: ApiError) => this.handleSaveError(err),
        });
    }

    protected errorFor(field: FormField): string | null {
        const control = this.form.controls[field];
        if (!control.touched || !control.errors) return null;

        const errors = control.errors;
        if (errors['required']) return 'This field is required.';
        if (errors['blank']) return 'This field cannot be blank.';
        if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters.`;
        if (errors['pattern']) return 'Enter a price with up to 8 whole digits and 2 decimal places.';
        if (errors['min']) return 'Stock quantity cannot be negative.';
        if (errors['max']) return `Stock quantity cannot exceed ${MAX_STOCK_QUANTITY}.`;
        if (errors['integer']) return 'Stock quantity must be a whole number.';
        if (errors['server']) return errors['server'];
        return 'Invalid value.';
    }

    protected isInvalid(field: FormField): boolean {
        return this.errorFor(field) !== null;
    }

    private loadProduct(id: number): void {
        this.isLoading.set(true);
        this.productService.getById(id)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.isLoading.set(false)),
            )
            .subscribe({
                next: product => this.form.patchValue({
                    name: product.name,
                    category: product.category,
                    sku: product.sku,
                    price: product.price,
                    stock_quantity: product.stock_quantity,
                    is_active: product.is_active,
                }),
                error: (err: ApiError) => {
                    this.notifyService.error(err.message);
                    this.router.navigate(['/products']);
                },
            });
    }

    private toPayload(): ProductPayload {
        const value = this.form.getRawValue();
        return {
            name: value.name.trim(),
            category: value.category,
            sku: value.sku.trim(),
            price: value.price.trim(),
            stock_quantity: value.stock_quantity,
            is_active: value.is_active,
        };
    }

    private handleSaveError(err: ApiError): void {
        if (err.fieldErrors) {
            for (const [field, message] of Object.entries(err.fieldErrors)) {
                const control = this.form.get(field);
                if (control) {
                    control.setErrors({ ...control.errors, server: message });
                    control.markAsTouched();
                }
            }
            this.notifyService.error(err.message);
        } else if (err.status >= 400 && err.status < 500) {
            this.notifyService.error(err.message);
        }
    }
}
