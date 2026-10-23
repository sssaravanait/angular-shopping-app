import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z',
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M20 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    label: 'Products',
    path: '/products',
    icon: 'm3 7 9-4 9 4-9 4-9-4z M3 7v10l9 4 9-4V7 M12 11v10 M7.5 5l9 4',
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: 'M5 3h14v18l-3.5-2-3.5 2-3.5-2L5 21V3z M8 8h8M8 12h8M8 16h4',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly isOpen = input(false);
  readonly navigate = output<void>();
  protected readonly navItems = NAV_ITEMS;
}