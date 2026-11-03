import { Routes } from '@angular/router';
import { ProductsComponent } from './products';

export const PRODUCTS_ROUTES: Routes = [
    {
        path: '',
        title: 'Products',
        component: ProductsComponent,
    },
    {
        path: 'create',
        title: 'Create product',
        loadComponent: () => import('./product-form/product-form').then(module => module.ProductForm),
    },
    {
        path: ':id/edit',
        title: 'Edit product',
        loadComponent: () => import('./product-form/product-form').then(module => module.ProductForm),
    },
];
