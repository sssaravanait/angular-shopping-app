import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './core/layout/admin-layout.component';

export const routes: Routes = [
	{
		path: '',
		component: AdminLayoutComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
			{
				path: 'dashboard',
				loadChildren: () =>
					import('./features/dashboard/dashboard.routes').then((module) => module.DASHBOARD_ROUTES),
			},
			{
				path: 'customers',
				loadChildren: () =>
					import('./features/customers/customers.routes').then((module) => module.CUSTOMERS_ROUTES),
			},
			{
				path: 'products',
				loadChildren: () =>
					import('./features/products/products.routes').then((module) => module.PRODUCTS_ROUTES),
			},
			{
				path: 'orders',
				loadChildren: () =>
					import('./features/orders/orders.routes').then((module) => module.ORDERS_ROUTES),
			},
		],
	},
	{ path: '**', redirectTo: 'dashboard' },
];
