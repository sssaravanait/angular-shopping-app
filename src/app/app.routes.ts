import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AdminLayoutComponent } from './core/layout/admin-layout.component';
import { ADMIN_LOGIN_URL, ADMIN_ROUTE } from './core/routes/admin-routes';
import { Login } from './features/auth/login/login';

export const routes: Routes = [
	{
		path: ADMIN_ROUTE,
		component: AdminLayoutComponent,
		canActivate: [authGuard],
		canActivateChild: [authGuard],
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
    {
        path: `${ADMIN_ROUTE}/login`,
        component: Login,
        pathMatch: 'full',
    },
	{ path: '**', redirectTo: ADMIN_LOGIN_URL },
];
