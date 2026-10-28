import { Routes } from '@angular/router';
import { FeaturePlaceholderComponent } from '../feature-placeholder.component';
import { CustomerComponent } from './customers';

export const CUSTOMERS_ROUTES: Routes = [
    {
        path: '',
        title: 'Customers',
        component: CustomerComponent,
    },
    {
        path: 'create',
        title: 'Create customer',
        loadComponent: () => import("./customer-form/customer-form").then(m => m.CustomerForm),
    },
    {
        path: ':id/edit',
        title: 'Edit customer',
        loadComponent: () => import("./customer-form/customer-form").then(m => m.CustomerForm),
    }
];