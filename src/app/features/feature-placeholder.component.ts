import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-feature-placeholder',
  template: `
    <section aria-labelledby="feature-title">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">Workspace</p>
      <h1 class="text-2xl font-semibold text-slate-950" id="feature-title">{{ title }}</h1>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        The {{ title.toLowerCase() }} workspace is ready for its feature view.
      </p>
    </section>
  `,
})
export class FeaturePlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly title = this.route.snapshot.data['title'] as string;
}