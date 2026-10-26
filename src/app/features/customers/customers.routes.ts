import { Routes } from '@angular/router';
import { CustomerComponent } from './customers';

export const CUSTOMERS_ROUTES: Routes = [
    {
        path: '',
        component: CustomerComponent,
        data: { title: 'Customers' },
    },
];