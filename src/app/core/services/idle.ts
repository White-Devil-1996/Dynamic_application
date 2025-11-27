// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class Idle {
  
// }



import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Auth } from './auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Idle implements OnDestroy {
  // inactivity time: configurable via `environment.idleTimeoutMs`
  private readonly idleTimeMs = environment.idleTimeoutMs ?? 15 * 60 * 1000;
  // pre-warning period before final logout (milliseconds)
  private readonly preWarnMs = environment.idlePrewarnMs ?? 30 * 1000;

  private activitySub?: Subscription;
  private activityCloseSub?: Subscription;
  private authSub?: Subscription;
  private visibilitySub?: Subscription;
  private currentSwal?: any;
  private closedByActivity = false;
  private preWarnInterval?: any;
  private readonly debug = !environment.production;

  constructor(private auth: Auth, private router: Router) {
    if (this.debug) console.debug('[Idle] constructed, starting auth subscription');
    // Start / stop watching when user logs in / out
    this.authSub = this.auth.isAuthenticated$.subscribe((isAuth) => {
      if (this.debug) console.debug('[Idle] auth state changed:', isAuth);
      if (isAuth) {
        this.startWatching();
      } else {
        this.stopWatching();
      }
    });

    // Pause the timer when the tab becomes hidden (optional improvement)
    if (typeof document !== 'undefined' && 'visibilityState' in document) {
      const visibilityChanges$ = fromEvent(document, 'visibilitychange');
      this.visibilitySub = visibilityChanges$.subscribe(() => {
        if (this.debug) console.debug('[Idle] visibilitychange, hidden=', document.hidden);
        if (document.hidden) {
          this.stopWatching();
        } else if (this.auth.hasAccessToken()) {
          this.startWatching();
        }
      });
    }
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

    // Close any open pre-warning dialog when user becomes active
    this.activityCloseSub = activityEvents$.subscribe(() => {
      if (this.currentSwal) {
        if (this.debug) console.debug('[Idle] activity detected while pre-warn dialog open; closing dialog');
        this.closedByActivity = true;
        Swal.close();
      }
    });

    // trigger immediately, then reset pre-warning timer on every activity
    const effectivePreWarn = Math.min(this.preWarnMs, Math.max(0, this.idleTimeMs - 1000));
    const timeUntilPrewarn = Math.max(0, this.idleTimeMs - effectivePreWarn);

    this.activitySub = activityEvents$
      .pipe(startWith(null), switchMap(() => timer(timeUntilPrewarn)))
      .subscribe(() => {
        if (this.debug) console.debug('[Idle] pre-warn timer fired; showing pre-warning dialog in', effectivePreWarn, 'ms');
        this.showPreWarning(effectivePreWarn);
      });
  }

  private stopWatching(): void {
    if (this.activitySub) {
      this.activitySub.unsubscribe();
      this.activitySub = undefined;
    }
    if (this.activityCloseSub) {
      if (this.debug) console.debug('[Idle] unsubscribing activityCloseSub');
      this.activityCloseSub.unsubscribe();
      this.activityCloseSub = undefined;
    }

    // close any open dialog and clear interval
    if (this.currentSwal) {
      if (this.debug) console.debug('[Idle] closing active swal');
      try {
        Swal.close();
      } catch (e) {
        // ignore
      }
      this.currentSwal = undefined;
    }
    if (this.preWarnInterval) {
      if (this.debug) console.debug('[Idle] clearing preWarnInterval');
      clearInterval(this.preWarnInterval);
      this.preWarnInterval = undefined;
    }
  }

  private showPreWarning(preWarnMs: number): void {
    if (this.debug) console.debug('[Idle] showPreWarning called (preWarnMs=', preWarnMs, ')');
    // stop watching while showing dialog
    this.stopWatching();

    this.closedByActivity = false;

    const secs = Math.ceil(preWarnMs / 1000);
    this.currentSwal = Swal.fire({
      icon: 'warning',
      title: 'You are inactive',
      html: `You will be logged out in <b>${secs}</b> seconds.`,
      timer: preWarnMs,
      timerProgressBar: true,
      showCancelButton: true,
      confirmButtonText: 'Stay signed in',
      cancelButtonText: 'Log out',
      allowOutsideClick: false,
      didOpen: (popup) => {
        if (this.debug) console.debug('[Idle] pre-warn swal opened');
        const b = popup.querySelector('b');
        const end = Date.now() + preWarnMs;
        this.preWarnInterval = setInterval(() => {
          const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
          if (b) {
            b.textContent = String(left);
          }
        }, 250);
      },
      willClose: () => {
        if (this.debug) console.debug('[Idle] pre-warn swal willClose');
        if (this.preWarnInterval) {
          clearInterval(this.preWarnInterval);
          this.preWarnInterval = undefined;
        }
      },
    }).then((result) => {
      if (this.debug) console.debug('[Idle] pre-warn swal closed, result=', result);
      // if the dialog was closed because of activity, treat as stay-signed-in
      if (this.closedByActivity) {
        if (this.debug) console.debug('[Idle] dialog closed by activity — resuming watch');
        this.closedByActivity = false;
        this.startWatching();
        return;
      }

      if (result.isConfirmed) {
        if (this.debug) console.debug('[Idle] user chose to stay signed in — resuming watch');
        this.startWatching();
      } else {
        if (this.debug) console.debug('[Idle] user chose to logout (or timed out) — logging out now');
        // final logout
        this.auth.logout();
        setTimeout(() => this.router.navigate(['/login']), 50);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.debug) console.debug('[Idle] ngOnDestroy — cleaning up');
    this.stopWatching();
    if (this.authSub) {
      this.authSub.unsubscribe();
      this.authSub = undefined;
    }
    if (this.visibilitySub) {
      this.visibilitySub.unsubscribe();
      this.visibilitySub = undefined;
    }
  }
}
