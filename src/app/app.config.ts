// import { ApplicationConfig } from '@angular/core';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { authInterceptorFn } from './core/interceptors/authinterceptor';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideHttpClient(
//       withInterceptors([
//         authInterceptorFn,
//       ])
//     ),
//   ],
// };



// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/authinterceptor';
import { Loaderinterceptor } from './core/interceptors/loaderinterceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // 👇 This enables interceptors resolved from DI
    provideHttpClient(withInterceptorsFromDi()),

    // 👇 Register your class-based interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },

     {
    provide: HTTP_INTERCEPTORS,
    useClass: Loaderinterceptor,
    multi: true,
  },

    // keep your other providers here (animations, store, etc.)
  ],
};
