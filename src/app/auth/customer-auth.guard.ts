import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

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

    await this.oktaAuth.signInWithRedirect({
      originalUri: state.url || '/',
      state: JSON.stringify({ customerId }),
    });

    return false;
  }
}
