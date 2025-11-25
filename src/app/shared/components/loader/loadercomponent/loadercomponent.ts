import { Component } from '@angular/core';
import { Loader } from '../../../../core/services/loader';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-loadercomponent',
  imports: [CommonModule],
  templateUrl: './loadercomponent.html',
  styleUrl: './loadercomponent.css',
})
export class Loadercomponent {
  isLoading$: Observable<boolean>;

  constructor(private loaderService: Loader) {
    this.isLoading$ = this.loaderService.loader$;
  }
}
