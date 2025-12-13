import { Routes } from '@angular/router';

import { HostComponent } from './view/host/host.component';

export const appRoutes: Routes = [
  { path: '', component: HostComponent },
  { path: '**', redirectTo: '' },
  { path: 'home', redirectTo: '' }
];
