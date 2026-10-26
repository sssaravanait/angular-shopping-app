import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { environment } from '../environments/environment'

export const appConfig: ApplicationConfig = {
  providers: [
        provideBrowserGlobalErrorListeners(), 
        provideRouter(routes),
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
