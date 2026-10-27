import { Routes } from '@angular/router';
import { FeaturePlaceholderComponent } from '../feature-placeholder.component';
import { CustomerComponent } from './customers';

export const CUSTOMERS_ROUTES: Routes = [
    {
        path: '',
        component: CustomerComponent,
        data: { title: 'Customers' },
    },
    {
        path: 'create',
        component: FeaturePlaceholderComponent,
        data: { title: 'Create Customer' },
    },
];