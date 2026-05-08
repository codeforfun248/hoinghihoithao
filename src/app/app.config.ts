import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from '../interceptors/credentials.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // 1. Import này
import { NZ_I18N, vi_VN } from 'ng-zorro-antd/i18n';
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  GoogleLoginProvider,
} from '@abacritt/angularx-social-login';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
// Đăng ký locale cho Angular
registerLocaleData(vi);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideAnimationsAsync(), // 2. Thêm vào đây
    importProvidersFrom(SocialLoginModule),
    { provide: NZ_I18N, useValue: vi_VN },
    // ✅ QUAN TRỌNG NHẤT
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '495553470400-egu5kuc41mjj9cu70cgul0datv1537lb.apps.googleusercontent.com',
              {
                oneTapEnabled: false, // <===== default is true
              },
            ),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
};
