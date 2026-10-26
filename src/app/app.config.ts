import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
        provideBrowserGlobalErrorListeners(), 
        provideRouter(routes),
        providePrimeNG({
            license: "eyJpZCI6IjBjNmM3ZjBlLWE2MzUtNDYxZC05ZThmLTBkMmFiYWY0MzY2YSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3OTAyNDU4NjMsImV4cCI6MTgyMTc4MTg2M30.HqJ2weBXyEV8dwa5KFVADdRmniB-jg08dsHU4nzjP_5Y_cw5fGlX2WUSPu1qOdVdgiz8VrHGduoIRggLqdSoAg",
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
