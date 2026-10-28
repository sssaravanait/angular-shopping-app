import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Wraps PrimeNG's MessageService so components never depend on
 * PrimeNG directly. If you switch UI libraries later, only this file changes.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
    private readonly messages = inject(MessageService);

    success(detail: string, summary = 'Success'): void {
        this.messages.add({ severity: 'success', summary, detail, life: 3000 })
    }

    info(detail: string, summary = 'Info'): void {
        this.messages.add({ severity: 'info', summary, detail, life: 5000 })
    }

    warning(detail: string, summary = 'Warning'): void {
        this.messages.add({ severity: 'warning', summary, detail, life: 5000 })
    }

    error(detail: string, summary = 'Error'): void {
        this.messages.add({ severity: 'error', summary, detail, life: 5000 })
    }
}