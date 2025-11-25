import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterOutlet,
  RouterLink,
  NavigationEnd,
} from '@angular/router';

import { filter } from 'rxjs/operators';
import { Auth } from '../../../../core/services/auth';
import { Nav } from '../../../../core/services/nav';

type MenuItem = {
  id: string;
  label: string;
  route?: string;
  icon?: string;
  children?: MenuItem[];
};

type AppModel = {
  brand: { title: string };
  topbar: { userLabelPrefix?: string; showLogout?: boolean };
  menus: MenuItem[];
  footer: { copyrightPrefix: string; name: string };
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  openSubmenu: string | null = null;
  collapsed = false;
  currentYear = new Date().getFullYear();
  isMobile = false;

  // Active menu id always comes from router
  activeMenuId: string | null = null;

  appModel: AppModel = {
    brand: { title: 'Dynamic Application' },
    topbar: { userLabelPrefix: 'Hi,', showLogout: true },
    menus: [],
    footer: { copyrightPrefix: '©', name: 'Nestora' },
  };

  constructor(
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute,
    private navService: Nav
  ) {}

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768;
    this.collapsed = this.isMobile;

    // Single source of truth for navigation and labels
    this.appModel = {
      brand: { title: 'Dynamic Application' },
      topbar: { userLabelPrefix: 'Hi,', showLogout: true },
      menus: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'fa fa-tachometer',
          route: '/home/container/dashboard', // leaf -> header will show
        },
        {
          id: 'customers',
          label: 'Customers',
          icon: 'fa fa-user',
          route: '/home/container/dynamic-grid', // leaf -> header will show
        },
        {
          id: 'management',
          label: 'Management',
          icon: 'fa fa-users',
          children: [
            {
              id: 'management-users',
              label: 'Users',
              icon: 'fa fa-user',
              route: '/home/container/dynamic-grids', // leaf -> header will show
            },
            {
              id: 'management-tenants',
              label: 'Tenants',
              icon: 'fa fa-building',
              route: '/home/container/tenants', // leaf -> header will show
            },
          ],
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'fa fa-cog',
          children: [
            {
              id: 'settings-profile',
              label: 'Profile',
              icon: 'fa fa-id-card',
              route: '/home/container/profile', // leaf -> header will show
            },
            {
              id: 'settings-billing',
              label: 'Billing',
              icon: 'fa fa-credit-card',
              route: '/home/container/billing', // leaf -> header will show
            },
          ],
        },
      ],
      footer: { copyrightPrefix: '©', name: 'Nestora' },
    };

    // Ensure we set header and active menu from the URL on load
    this.updateActiveFromUrl(this.router.url);

    // Update on every navigation end
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.updateActiveFromUrl(e.urlAfterRedirects);
      });
  }

  /**
   * Determine matching menu/child for the current URL.
   * Only set the header label when the matched item is a leaf (no children).
   */
  updateActiveFromUrl(url: string) {
    url = url.replace(/\/+$/, '');
    let matchedId: string | null = null;
    let matchedLabel: string | null = null;

    for (const m of this.appModel.menus) {
      // If top-level menu is a leaf (no children) and matches URL -> select it
      if ((!m.children || m.children.length === 0) && m.route && url === m.route.replace(/\/+$/, '')) {
        matchedId = m.id;
        matchedLabel = m.label;
      }

      // If it has children, check children routes (children are leaves)
      if (m.children) {
        for (const c of m.children) {
          if (c.route && url === c.route.replace(/\/+$/, '')) {
            matchedId = c.id;
            matchedLabel = c.label;
            this.openSubmenu = m.id; // Auto-open parent submenu when child is active
          }
        }
      }
    }

    this.activeMenuId = matchedId;

    // Only set header label when we found a matched label (i.e. a leaf). Otherwise don't change header.
    if (matchedLabel) {
      this.navService.setLabel(matchedLabel);
    } else {
      // If no matched leaf found, don't overwrite the current header label.
      // Optionally you might want to fallback to deriveTitleFromUrl(url) here; currently we preserve existing label.
    }
  }

  deriveTitleFromUrl(url: string): string {
    const seg = url.split('/').filter(Boolean).pop() ?? 'Dashboard';
    return seg.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  isActive(item: MenuItem) {
    return this.activeMenuId === item.id;
  }

  /**
   * Top-level click:
   * - If the item has children -> toggle submenu only, DO NOT set header label.
   * - If the item has no children -> it's a leaf, set header label and mark active.
   */
  onTopLevelClick(menu: MenuItem) {
    if (menu.children?.length) {
      this.toggleSubmenu(menu.id);
      // do NOT set navService.setLabel(menu.label) for parent items with children
      return;
    }
    // leaf top-level item -> set header + active id
    this.activeMenuId = menu.id;
    this.navService.setLabel(menu.label);
    this.closeOnNavigate();
  }

  onChildClick(parent: MenuItem, child: MenuItem) {
    // child is a leaf -> set header + active id and ensure parent is open
    this.activeMenuId = child.id;
    this.openSubmenu = parent.id;
    this.navService.setLabel(child.label);
    this.closeOnNavigate();
  }

  toggleSubmenu(id: string) {
    this.openSubmenu = this.openSubmenu === id ? null : id;
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  closeOnNavigate() {
    if (this.isMobile) this.collapsed = true;
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) this.collapsed = false;
  }

  logout() {
    this.authService.logout();
    const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/login';
    this.router.navigateByUrl(redirect);
  }

  trackByMenu(index: number, item: MenuItem) {
    return item.id;
  }
}
