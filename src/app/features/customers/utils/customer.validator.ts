import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/**
 * Accepts only 10 to 15 digits (0-9). Nothing else is allowed:
 * no spaces, dashes, brackets, or leading "+".
 * Examples: "5551234567" is valid; "555-123-4567" and "+15551234567" are not.
 */
export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    if (!value) return null; // "required" handles empty values

    return /^[0-9]{10,15}$/.test(value) ? null : { phone: true };
};

/** Rejects a date of birth in the future. */
export const notInFutureValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as Date | null;
    if (!value) return null; // "required" handles empties
    return value > new Date() ? { futureDate: true } : null;
};

/** Ensures the customer is at least `minYears` old. */
export function minAgeValidator(minYears: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value as Date | null;
        if (!value) return null;

        const latestAllowedDob = new Date();
        latestAllowedDob.setFullYear(latestAllowedDob.getFullYear() - minYears);

        return value > latestAllowedDob ? { minAge: { requiredYears: minYears } } : null;
    };
}

/** Rejects strings that are only whitespace. Validators.required lets "   " through. */
export const notBlankValidator: ValidatorFn = Validators.pattern(/\S/);