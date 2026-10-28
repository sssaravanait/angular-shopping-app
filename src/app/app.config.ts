import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { environment } from '../environments/environment'
import { httpErrorInterceptor } from './core/http/http-error.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(), 
        provideHttpClient(
            withInterceptors([httpErrorInterceptor]),
            withXsrfConfiguration({
                cookieName: 'csrftoken',
                headerName: 'X-CSRFToken',
            }),
        ),
        provideRouter(routes, withComponentInputBinding()),
        MessageService,     // toast messages (singleton)
        ConfirmationService,    // confirm dialogs (singleton)
        providePrimeNG({
            license: environment.primeUiLicense,
            theme: {
                preset: Aura,
                options: {
                    cssLayer: {
                        name: 'primeng',
                        order: 'theme, base, primeng, components, utilities'
                    }
                }
            }
        })
    ],
};
