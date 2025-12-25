import { Routes } from '@angular/router';

import { LoginCallbackComponent } from './auth/login-callback.component';
import { LogoutComponent } from './auth/logout.component';
import { CustomerAuthGuard } from './auth/customer-auth.guard';
import { HostComponent } from './view/host/host.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginCallbackComponent },
  { path: 'logout', component: LogoutComponent },
  { path: '', component: HostComponent, canActivate: [CustomerAuthGuard] },
  { path: 'home', redirectTo: '' },
  { path: 'host', component: HostComponent, canActivate: [CustomerAuthGuard] },
  { path: '**', redirectTo: '' },
];
