import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, RouterOutlet, SidebarComponent],
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  protected readonly isSidebarOpen = signal(false);

  protected closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  protected toggleSidebar(): void {
    this.isSidebarOpen.update((isOpen) => !isOpen);
  }
}