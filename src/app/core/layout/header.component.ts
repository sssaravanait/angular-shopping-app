import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly menuExpanded = input(false);
  readonly menuToggle = output<void>();
}