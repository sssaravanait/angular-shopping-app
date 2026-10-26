import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ButtonDirective } from 'primeng/button';

@Component({
    imports: [],
    selector: "app-customers",
    // templateUrl: "customers",
    template: `<button pButton>Check</button>`,
    styleUrl: "./customers.css"
})

export class CustomerComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly title = this.route.snapshot.data['title'] as string;
}