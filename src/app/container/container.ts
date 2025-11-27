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
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-container',
  templateUrl: './container.html',
  styleUrls: ['./container.css'],
  imports: [RouterOutlet, CommonModule],
})
export class Container implements OnInit, OnDestroy {
  headerTitle = 'Dashboard';
  showBackButton = false;
  private sub = new Subscription();

  constructor(private navService: Nav, private router: Router) {}

  ngOnInit(): void {
    this.sub.add(this.navService.labelChanges$.subscribe((label) => {
      this.headerTitle = label ?? 'Dashboard';
    }));

    this.headerTitle = this.navService.getLabel() ?? 'Dashboard';

    // listen to router events to show/hide back button
    this.sub.add(this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // show back button when on form component (path contains 'dynamic-form')
        // hide back button when on grid component (path contains 'dynamic-grid')
        this.showBackButton = event.urlAfterRedirects.includes('dynamic-form');
      }
    }));
  }

  goBack(): void {
    this.router.navigate(['/home/container/dynamic-grid']);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
