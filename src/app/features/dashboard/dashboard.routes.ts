import { Routes } from '@angular/router';
import { FeaturePlaceholderComponent } from '../feature-placeholder.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: FeaturePlaceholderComponent,
    data: { title: 'Dashboard' },
  },
];