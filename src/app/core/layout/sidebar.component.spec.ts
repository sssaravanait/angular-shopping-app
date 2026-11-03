import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

@Component({
  template: 'Customers route',
})
class CustomersRouteComponent {}

describe('SidebarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([
          {
            path: 'admin',
            children: [{ path: 'customers', component: CustomersRouteComponent }],
          },
        ]),
      ],
    }).compileComponents();
  });

  it('should render all navigation links', async () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('nav a'),
    ) as HTMLAnchorElement[];

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Dashboard',
      'Customers',
      'Products',
      'Orders',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/admin/dashboard',
      '/admin/customers',
      '/admin/products',
      '/admin/orders',
    ]);
  });

  it('should navigate when a sidebar link is clicked', async () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const customersLink = fixture.nativeElement.querySelector(
      'a[href="/admin/customers"]',
    ) as HTMLAnchorElement;
    customersLink.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/admin/customers');
  });

  it('should not disable pointer events when the desktop sidebar is closed', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const sidebar = fixture.nativeElement.querySelector('aside') as HTMLElement;

    expect(sidebar.classList.contains('pointer-events-none')).toBe(false);
  });
});