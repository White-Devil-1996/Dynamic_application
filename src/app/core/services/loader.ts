import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Loader {
  private loaderCount = 0;
  private loaderSubject = new BehaviorSubject<boolean>(false);
  loader$ = this.loaderSubject.asObservable();

  show(): void {
    this.loaderCount++;
    if (this.loaderCount === 1) {
      this.loaderSubject.next(true);
    }
  }

  hide(): void {
    if (this.loaderCount > 0) {
      this.loaderCount--;
    }
    if (this.loaderCount === 0) {
      this.loaderSubject.next(false);
    }
  }

  reset(): void {
    this.loaderCount = 0;
    this.loaderSubject.next(false);
  }
}
