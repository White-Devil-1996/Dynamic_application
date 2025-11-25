import { Component } from '@angular/core';
import { Auth } from '../core/services/auth';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  constructor(
    private authService: Auth,
    private router: Router,
     private route: ActivatedRoute
  ) { }


  // logout(){this.authService.logout()
  //    const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/login';
  //          this.router.navigateByUrl(redirect);
  // }
}
