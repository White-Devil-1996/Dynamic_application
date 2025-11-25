import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';
import { Auth } from '../services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();

    // Attach token to all requests except login/refresh if you want
    let authReq = req;
    if (accessToken && !this.isAuthEndpoint(req.url)) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // ❌ If error is from login or refresh request, DO NOT try refresh
        if (this.isAuthEndpoint(req.url)) {
          return throwError(() => error);
        }

        // ✅ Only here we try refreshing
        if (error.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;
          return this.authService.refreshToken().pipe(
            switchMap((res) => {
              this.isRefreshing = false;
              const newAccessToken = res.accessToken;

              const cloned = req.clone({
                setHeaders: { Authorization: `Bearer ${newAccessToken}` },
              });

              return next.handle(cloned);
            }),
            catchError((refreshError) => {
              this.isRefreshing = false;
              this.authService.logout();
              this.router.navigate(['/login']); // or '/auth/login'
              return throwError(() => refreshError);
            })
          );
        }

        // Any other error -> just pass it to the component
        return throwError(() => error);
      })
    );
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/login') || url.includes('/auth/refresh');
  }
}
