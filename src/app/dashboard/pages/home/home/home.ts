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
  brand: { title: string, applicationName: string };
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
    brand: { title: 'Dynamic Application',applicationName: 'Nestora Elite' },
    topbar: { userLabelPrefix: 'Navin,', showLogout: true },
    menus: [],
    footer: { copyrightPrefix: '©', name: 'Nestora' },
  };
  currentDateTime: Date;

  constructor(
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute,
    private navService: Nav
  ) {
    this.currentDateTime = new Date();
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768;
    this.collapsed = this.isMobile;

    // Single source of truth for navigation and labels
    this.appModel = {
  brand: { title: 'Dynamic Application', applicationName: 'Nestora Elite' },
  topbar: { userLabelPrefix: 'Navin,', showLogout: true },
  menus: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fa fa-tachometer-alt',
      route: '/home/container/dashboard',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: 'fa fa-users',
      route: '/home/container/dynamic-grid',
    },
    {
      id: 'management',
      label: 'Management',
      icon: 'fa fa-users-cog',
      children: [
        {
          id: 'management-CustomerManagement',
          label: 'Customer Management',
          icon: 'fa fa-user-cog',
          route: '/home/container/dynamic-grid',
        },
        {
          id: 'management-InitiateCustomer',
          label: 'Initiate Customer',
          icon: 'fa fa-user-plus',
          route: '/home/container/dynamic-form',
        },
      ],
    },
    {
      id: 'bedcounts',
      label: 'Bed counts',
      icon: 'fa fa-bed',
      route: '/home/container/dynamic-grid1',
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: 'fa fa-file-alt',
      route: '/home/container/dynamic-grid2',
    },
    {
      id: 'billingpayments',
      label: 'Billing Payments',
      icon: 'fa fa-file-invoice-dollar',
      route: '/home/container/dynamic-grid3',
    },
    {
      id: 'notices',
      label: 'Notices & Communication',
      icon: 'fa fa-bell',
      route: '/home/container/dynamic-grid4',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'fa fa-chart-bar',
      route: '/home/container/dynamic-grid6',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'fa fa-cog',
      children: [
        {
          id: 'settings-profile',
          label: 'Profile',
          icon: 'fa fa-user-circle',
          route: '/home/container/profile',
        },
        {
          id: 'settings-adminpanel',
          label: 'Admin Panel',
          icon: 'fa fa-tools',
          route: '/home/container/adminpanel',
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
    // strip query string and fragment, and trailing slashes so matching is path-only
    url = String(url).split('?')[0].split('#')[0].replace(/\/+$/, '');
    let matchedId: string | null = null;
    let matchedLabel: string | null = null;

    // simple alias map: routes that should highlight an existing menu
    const aliasMap: { [k: string]: { id: string; label: string } } = {
      '/home/container/dynamic-form': { id: 'management-InitiateCustomer', label: 'Initiate Customer' },
      '/home/container/dynamic-form/': { id: 'management-InitiateCustomer', label: 'Initiate Customer' }
    };

    for (const m of this.appModel.menus) {
      // If top-level menu is a leaf (no children) and matches URL -> select it
      if ((!m.children || m.children.length === 0) && m.route) {
        const cleanRoute = m.route.replace(/\/+$/, '');
        if (url === cleanRoute) {
          matchedId = m.id;
          matchedLabel = m.label;
          break; // Stop searching once we find a match
        }
      }

      // If it has children, check children routes (children are leaves)
      if (m.children) {
        for (const c of m.children) {
          if (c.route) {
            const cleanRoute = c.route.replace(/\/+$/, '');
            if (url === cleanRoute) {
              matchedId = c.id;
              matchedLabel = c.label;
              this.openSubmenu = m.id; // Auto-open parent submenu when child is active
              break; // Stop searching once we find a match
            }
          }
        }
        // If we found a match in children, break outer loop too
        if (matchedId) break;
      }
    }

    // If no exact match found, check aliases (use startsWith for safety)
    if (!matchedId) {
      for (const aliasRoute of Object.keys(aliasMap)) {
        if (url === aliasRoute || url.startsWith(aliasRoute + '/')) {
          matchedId = aliasMap[aliasRoute].id;
          matchedLabel = aliasMap[aliasRoute].label;
          // Find parent if this is a child item
          const parentId = aliasMap[aliasRoute].id.split('-')[0];
          for (const m of this.appModel.menus) {
            if (m.id === parentId && m.children) {
              this.openSubmenu = m.id;
              break;
            }
          }
          break;
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
