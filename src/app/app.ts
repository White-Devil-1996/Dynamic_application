import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loadercomponent } from './shared/components/loader/loadercomponent/loadercomponent';
import { Idle } from './core/services/idle';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Loadercomponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Dynamic_Application');
  constructor(private idle: Idle) {
    // ensure Idle service is instantiated at app startup
  }
}
