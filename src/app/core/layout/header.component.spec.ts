import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should emit when the mobile menu toggle is clicked', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    let toggleCount = 0;
    fixture.componentInstance.menuToggle.subscribe(() => toggleCount++);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      'button[aria-label="Toggle navigation"]',
    ) as HTMLButtonElement;
    toggle.click();

    expect(toggleCount).toBe(1);
  });
});