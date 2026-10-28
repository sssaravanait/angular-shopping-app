import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
    imports: [RouterOutlet, Toast, ConfirmDialog],
    selector: 'app-root',
    styleUrl: './app.css',
    templateUrl: './app.html',
})
export class App {
    protected readonly title = signal('angular-shopping-app');
}
