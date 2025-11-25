// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class Idle {
  
// }



import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class Idle {
  // inactivity time (e.g. 15 minutes)
  private readonly idleTimeMs = 1 * 60 * 1000;

  private activitySub?: Subscription;
  private authSub?: Subscription;

  constructor(
    private Auth: Auth,
    private router: Router
  ) {
    // Start / stop watching when user logs in / out
    this.authSub = this.Auth.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.startWatching();
      } else {
        this.stopWatching();
      }
    });
  }

  private startWatching(): void {
    this.stopWatching(); // just in case

    const activityEvents$ = merge(
      fromEvent(window, 'click'),
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'keydown'),
      fromEvent(window, 'scroll'),
      fromEvent(window, 'touchstart')
    );

    this.activitySub = activityEvents$
      .pipe(
        // trigger immediately, then reset timer on every activity
        startWith(null),
        switchMap(() => timer(this.idleTimeMs))
      )
      .subscribe(() => this.handleTimeout());
  }

  private stopWatching(): void {
    if (this.activitySub) {
      this.activitySub.unsubscribe();
      this.activitySub = undefined;
    }
  }

  private handleTimeout(): void {
    // show SweetAlert and then logout
    Swal.fire({
      icon: 'warning',
      title: 'Session expired',
      text: 'You have been logged out due to inactivity.',
      confirmButtonText: 'OK',
    }).then(() => {
      this.Auth.logout();
      this.router.navigate(['/login']); // or '/auth/login'
    });

    this.stopWatching();
  }
}
