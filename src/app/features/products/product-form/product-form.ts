import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, OnInit, computed, inject, input, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import { ApiError } from '../../../core/models/api-error.model';
import { NotificationService } from '../../../core/services/notification.service';
import { MAX_STOCK_QUANTITY, ProductCategory, ProductImage, ProductPayload, PRODUCT_CATEGORIES } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { notBlankValidator, positiveIntegerValidator } from '../utils/product.validator';

const MAX_PRODUCT_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif']);
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif']);

type FormField = 'name' | 'category' | 'sku' | 'price' | 'stock_quantity' | 'description';
type ImagePreview = { readonly file: File; readonly url: string };

function imageCountValidator(getExistingImageCount: () => number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const selectedFiles: unknown = control.value;
        const selectedCount = Array.isArray(selectedFiles) ? selectedFiles.length : 0;
        const totalCount = getExistingImageCount() + selectedCount;

        if (totalCount < 1) return { minImages: { required: 1, actual: totalCount } };
        if (totalCount > MAX_PRODUCT_IMAGES) {
            return { maxImages: { maximum: MAX_PRODUCT_IMAGES, actual: totalCount } };
        }
        return null;
    };
}

function isAllowedImage(file: File): boolean {
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    return ALLOWED_IMAGE_TYPES.has(file.type)
        || (!file.type && ALLOWED_IMAGE_EXTENSIONS.has(extension));
}

@Component({
    selector: 'app-product-form',
    imports: [ReactiveFormsModule, RouterLink, ButtonModule, FileUploadModule, InputTextModule, TextareaModule],
    templateUrl: './product-form.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductForm implements OnInit, OnDestroy {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly productService = inject(ProductService);
    private readonly notifyService = inject(NotificationService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);

    readonly id = input<number | undefined, unknown>(undefined, {
        transform: value => value == null ? undefined : Number(value),
    });

    protected readonly categories = PRODUCT_CATEGORIES;
    protected readonly isEditMode = computed(() => this.id() !== undefined);
    protected readonly title = computed(() => this.isEditMode() ? 'Edit product' : 'Create product');
    protected readonly isLoading = signal(false);
    protected readonly isSubmitting = signal(false);
    protected readonly existingImages = signal<readonly ProductImage[]>([]);
    protected readonly deletedImageIds = signal<readonly number[]>([]);
    protected readonly imagePreviews = signal<readonly ImagePreview[]>([]);
    protected readonly uploadError = signal<string | null>(null);
    protected readonly maxImageSizeBytes = MAX_IMAGE_SIZE_BYTES;
    protected readonly imageAccept = 'image/jpeg,image/png,image/gif,.jpg,.jpeg,.png,.gif';

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
        description: ['', Validators.maxLength(1000)],
        product_images: this.fb.array<File>([], {
            validators: [imageCountValidator(() => this.existingImages().length)],
        }),
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
                this.router.navigate(['..'], { relativeTo: this.route });
            },
            error: (err: ApiError) => this.handleSaveError(err),
        });
    }

    ngOnDestroy(): void {
        for (const preview of this.imagePreviews()) {
            URL.revokeObjectURL(preview.url);
        }
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

    protected imageError(): string | null {
        const control = this.form.controls.product_images;
        if (!control.touched || !control.errors) return null;
        if (control.errors['minImages']) return 'Add at least one product image.';
        if (control.errors['maxImages']) return `You can add up to ${MAX_PRODUCT_IMAGES} images.`;
        if (control.errors['server']) return control.errors['server'];
        return null;
    }

    protected remainingImageSlots(): number {
        return Math.max(0, MAX_PRODUCT_IMAGES - this.existingImages().length);
    }

    protected onImagesSelected(event: { currentFiles: File[] }): void {
        const control = this.form.controls.product_images;
        const currentFiles = new Set(control.controls.map(fileControl => fileControl.value));
        let currentTotal = this.existingImages().length + control.length;
        const acceptedFiles: File[] = [];
        this.uploadError.set(null);

        for (const file of event.currentFiles) {
            if (currentFiles.has(file)) continue;
            if (!isAllowedImage(file)) {
                this.uploadError.set(`${file.name}: choose a JPG, PNG, or GIF image.`);
                continue;
            }
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                this.uploadError.set(`${file.name}: each image must be 2 MB or smaller.`);
                continue;
            }
            if (currentTotal >= MAX_PRODUCT_IMAGES) {
                this.uploadError.set(`You can add up to ${MAX_PRODUCT_IMAGES} images.`);
                break;
            }

            acceptedFiles.push(file);
            currentFiles.add(file);
            currentTotal++;
        }

        for (const file of acceptedFiles) {
            control.push(this.fb.control(file));
            this.imagePreviews.update(previews => [
                ...previews,
                { file, url: URL.createObjectURL(file) },
            ]);
        }

        if (acceptedFiles.length > 0) control.markAsDirty();
        control.updateValueAndValidity();
    }

    protected previewFor(file: File): ImagePreview | undefined {
        return this.imagePreviews().find(preview => preview.file === file);
    }

    protected removeSelectedImage(file: File): void {
        const control = this.form.controls.product_images;
        const index = control.controls.findIndex(fileControl => fileControl.value === file);
        if (index === -1) return;

        control.removeAt(index);
        control.markAsDirty();
        control.markAsTouched();
        this.imagePreviews.update(previews => {
            const removedPreview = previews.find(preview => preview.file === file);
            if (removedPreview) URL.revokeObjectURL(removedPreview.url);
            return previews.filter(preview => preview.file !== file);
        });
        this.uploadError.set(null);
    }

    protected removeExistingImage(image: ProductImage): void {
        this.existingImages.update(images => images.filter(current => current.id !== image.id));
        this.deletedImageIds.update(ids => ids.includes(image.id) ? ids : [...ids, image.id]);
        const control = this.form.controls.product_images;
        control.markAsDirty();
        control.markAsTouched();
        control.updateValueAndValidity();
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
                next: product => {
                    this.form.patchValue({
                        name: product.name,
                        category: product.category,
                        sku: product.sku,
                        price: product.price,
                        stock_quantity: product.stock_quantity,
                        is_active: product.is_active,
                        description: product.description ?? '',
                    });
                    this.existingImages.set(product.product_images ?? []);
                    this.form.controls.product_images.updateValueAndValidity();
                },
                error: (err: ApiError) => {
                    this.notifyService.error(err.message);
                    this.router.navigate(['..'], { relativeTo: this.route });
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
            description: value.description,
            product_images: value.product_images,
            deleted_product_image_ids: this.deletedImageIds(),
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
