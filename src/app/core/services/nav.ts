import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Nav {
  private label$ = new BehaviorSubject<string>('Dashboard');

  get labelChanges$(): Observable<string> {
    return this.label$.asObservable();
  }

  setLabel(value: string) {
    if (typeof value === 'string' && value.trim().length) {
      this.label$.next(value.trim());
    }
  }

  getLabel(): string {
    return this.label$.getValue();
  }
}
