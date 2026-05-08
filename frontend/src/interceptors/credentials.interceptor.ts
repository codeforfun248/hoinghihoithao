import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone request và thêm withCredentials: true
  const clonedRequest = req.clone({
    withCredentials: true,
  });

  return next(clonedRequest);
};
