import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot, } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Auth } from '../services/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      map((isAuth) => {
        if (isAuth) {
          return true;
        }
        // if not authenticated, send to landing/login
        return this.router.createUrlTree(['/login'], {
          queryParams: { redirect: state.url },
        });
      })
    );
  }
}
