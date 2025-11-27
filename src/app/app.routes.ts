import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Login } from './auth/pages/login/login/login';
import { AuthGuard } from './core/guards/auth-guard';
import { Home } from './dashboard/pages/home/home/home';
import { DynamicGrid } from './dynamic-grid/dynamic-grid';
import { Container } from './container/container';
import { DynamicForm } from './dynamic-form/dynamic-form';
// import { Tenants } from './tenants/tenants';     // <-- create or replace with your component
// import { Profile } from './settings/profile';    // <-- create or replace
// import { Billing } from './settings/billing';    // <-- create or replace

export const routes: Routes =  [
  { path: 'login', component: Login },
  {
    path: 'home',
    component: Home,
    // canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'container', pathMatch: 'full' },
      {
        path: 'container',
        component: Container,
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: Dashboard },
          { path: 'dynamic-grid', component: DynamicGrid },
          { path: 'dynamic-form', component: DynamicForm },
        ],
      },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];


// [
//   { path: 'login', component: Login },

//   {
//     path: 'home',
//     component: Home,
//     canActivate: [AuthGuard],
//     children: [
//       { path: '', redirectTo: 'container', pathMatch: 'full' },
//       {
//         path: 'container',
//         component: Container,
//         children: [
//           // default inside container -> dashboard
//           { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

//           // dashboard
//           { path: 'dashboard', component: Dashboard }, // data now driven from Home's menu JSON

//           // dynamic grid + form page
//           { path: 'dynamic-grid', component: DynamicGrid },
//           { path: 'dynamic-form', component: DynamicForm },

//           // tenants/profile/billing pages (replace with your real components)
//           // { path: 'tenants', component: Tenants },
//           // { path: 'profile', component: Profile },
//           // { path: 'billing', component: Billing },
//         ],
//       },
//     ],
//   },

//   // root
//   { path: '', redirectTo: '/login', pathMatch: 'full' },
//   { path: '**', redirectTo: '/login', pathMatch: 'full' },
// ];
