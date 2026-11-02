import { ChangeDetectionStrategy, Component, inject, input, output, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, MenubarModule],
    selector: 'app-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);

    readonly menuExpanded = input(false);
    readonly menuToggle = output<void>();

    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Profile',
                items: [
                    { label: 'Profile Settings' }, 
                    { separator: true }, 
                    { label: 'Signout', command: () => this.logout() },
                ]
            }
        ];
    }

    protected logout(): void {
        this.auth.logout().subscribe(() => void this.router.navigateByUrl('/login'));
    }
}