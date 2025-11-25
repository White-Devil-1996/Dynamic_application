import { Component, OnDestroy, OnInit } from '@angular/core';
import { Nav } from '../core/services/nav';
import { Subscription } from 'rxjs';
import {
  ActivatedRoute,
  Router,
  RouterOutlet,
  RouterLink,
  NavigationEnd,
} from '@angular/router';

@Component({
  selector: 'app-container',
  templateUrl: './container.html',
  styleUrls: ['./container.css'],
  imports: [RouterOutlet],
})
export class Container implements OnInit, OnDestroy {
  headerTitle = 'Dashboard';
  private sub = new Subscription();

  constructor(private navService: Nav) {}

  ngOnInit(): void {
    this.sub.add(this.navService.labelChanges$.subscribe((label) => {
      this.headerTitle = label ?? 'Dashboard';
    }));

    this.headerTitle = this.navService.getLabel() ?? 'Dashboard';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
