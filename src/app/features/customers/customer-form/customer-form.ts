import { ChangeDetectionStrategy, computed, inject, signal, Component, DestroyRef, input, OnInit } from "@angular/core";
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from "@angular/forms";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";

import { ButtonModule } from "primeng/button";
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';

import { ApiError } from "../../../core/models/api-error.model";
import { NotificationService } from "../../../core/services/notification.service";
import { CustomerPayload } from "../models/customer.model";
import { CustomerService } from "../services/customer.service";
import { minAgeValidator, notBlankValidator, notInFutureValidator, phoneValidator } from "../utils/customer.validator";
import { toIsoDate, parseIsoDate } from "../../../core/utils/date.utils";

/** Form field names. A typed union prevents typos like 'frist_name'. */
type FormField = 'first_name' | 'last_name' | 'email' | 'phone' | 'dob';

@Component({
    selector: 'app-customer-form',
    imports: [ReactiveFormsModule, RouterLink, ButtonModule, DatePickerModule, InputTextModule],
    templateUrl: './customer-form.html',
    styleUrl: './customer-form.css',
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class CustomerForm implements OnInit {
    // ----- Dependencies -----
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly customerService = inject(CustomerService);
    private readonly notifyService = inject(NotificationService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    /**
     * Route param `:id`, bound automatically because we enabled
     * withComponentInputBinding() in app.config.ts.
     * The URL gives a string, so we transform it to a number.
     */

    readonly id = input<number | undefined, unknown>(undefined, {
        transform: (value) => (value == null ? undefined : Number(value)),
    });

    // ----- State -----
    protected readonly isEditMode = computed(() => this.id() !== undefined);
    protected readonly title = computed(() => (this.isEditMode() ? 'Edit customer' : 'Create customer'));
    protected readonly isLoading = signal(false);
    protected readonly isSubmitting = signal(false);
    protected readonly today = new Date();

    // ----- Form Definition -----
    protected readonly form = this.fb.group({
        first_name: ['', [Validators.required, notBlankValidator, Validators.maxLength(50)]],
        last_name: ['', [Validators.required, notBlankValidator, Validators.maxLength(50)]],
        email: ['', [Validators.required, notBlankValidator, Validators.email, Validators.maxLength(120)]],
        phone: ['', [Validators.required, phoneValidator]],
        dob: [null as Date | null, [Validators.required, notInFutureValidator, minAgeValidator(18)]],
    });

    ngOnInit(): void {
        const id = this.id();
        if (id !== undefined) {
            this.loadCustomer(id);
        }
    }

    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched(); // show all errors at once
            return;
        }

        const payload = this.toPayload();
        const id = this.id();

        // Choose the request once, then subscribe once.
        const request$ = (id !== undefined) ? this.customerService.update(id, payload) : this.customerService.create(payload);

        this.isSubmitting.set(true);

        request$.pipe(
            takeUntilDestroyed(this.destroyRef), // cancel the request if the user leaves the page
            finalize(() => this.isSubmitting.set(false)),
        )
        .subscribe({
            next: () => {
                this.notifyService.success(this.isEditMode() ? 'Customer updated successfully.' : 'Customer created successfully.');
                this.router.navigate(["/customers"]);
            },
            error: (err: ApiError) => this.handleSaveError(err),
        });
    }

    /** Used by the template to show a message under a field. Returns null when there is no error. */
    protected errorFor(field: FormField): string | null {
        const control = this.form.controls[field];
        // Only show errors after the user has touched the field (good UX).
        if (!control.touched || !control.errors) return null;

        const e = control.errors;
        if (e['required']) return 'This field is required.';
        if (e['email']) return 'Enter a valid email address.';
        if (e['maxlength']) return `Maximum ${e['maxlength'].requiredLength} characters.`;
        if (e['pattern']) return 'Enter 10 to 15 digits.';
        if (e['futureDate']) return 'Date of birth cannot be in the future.';
        if (e['minAge']) return `Customer must be at least ${e['minAge'].requiredYears} years old.`;
        if (e['server']) return e['server'];
        return 'Invalid value.';
    }

    protected isInvalid(field: FormField): boolean {
        return this.errorFor(field) !== null;
    }

    private loadCustomer(id: number): void {
        this.isLoading.set(true);

        this.customerService
            .getById(id)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.isLoading.set(false)),
            )
            .subscribe({
                next: (customer) => {
                    this.form.patchValue({
                        first_name: customer.first_name,
                        last_name: customer.last_name,
                        email: customer.email,
                        phone: customer.phone,
                        dob: parseIsoDate(customer.dob),
                    });
                },
                error: (err: ApiError) => {
                    this.notifyService.error(err.message)
                    this.router.navigate(["/customers"]);
                }
            });
    }

    /** Converts form values into the API payload (trims, normalizes). */
    private toPayload(): CustomerPayload {
        const v = this.form.getRawValue();
        return {
            first_name: v.first_name.trim(),
            last_name: v.last_name.trim(),
            email: v.email.trim(),
            phone: v.phone.replace(/[\s-]/g, ''), // remove spaces and dashes
            dob: toIsoDate(v.dob as Date),         // required validator guarantees a value
        };
    }

    /**
   * Maps server errors to the right fields.
   * 422 with fieldErrors -> show under each field.
   * Other 4xx -> toast. 5xx and network -> already toasted by the interceptor.
   */
    private handleSaveError(err: ApiError): void {
        if (err.status === 422 && err.fieldErrors) {
            for (const [field, message] of Object.entries(err.fieldErrors)) {
                const control = this.form.get(field);
                if (control) {
                    // Adds a "server" error. Angular re-runs validators on the next
                    // change, which clears it automatically.
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