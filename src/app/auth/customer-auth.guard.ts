import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

import { authContext } from './logging.util';

@Injectable({ providedIn: 'root' })
export class CustomerAuthGuard implements CanActivate {
  constructor(@Inject(OKTA_AUTH) private readonly oktaAuth: OktaAuth) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    const authenticated = await this.oktaAuth.isAuthenticated();
    if (authenticated) {
      return true;
    }

    const customerId = route.queryParamMap.get('customerId');

    console.info('[auth] redirecting to Okta', {
      ...authContext(),
      originalUri: state.url || '/',
      customerId: customerId ?? 'none',
    });

    await this.oktaAuth.signInWithRedirect({
      originalUri: state.url || '/',
      state: JSON.stringify({ customerId }),
    });

    return false;
  }
}
