import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

import { environment } from '../../environments/environment';
import { authContext } from './logging.util';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {
  protected signedOut = false;

  constructor(
    @Inject(OKTA_AUTH) private readonly oktaAuth: OktaAuth,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    void this.handleLogout();
  }

  protected async handleLogout(): Promise<void> {
    const done = this.route.snapshot.queryParamMap.has('done');
    if (done) {
      this.signedOut = true;
      return;
    }

    try {
      console.info('[auth] sign-out start', { ...authContext() });
      await this.oktaAuth.signOut({
        postLogoutRedirectUri: `${environment.auth.postLogoutRedirectUri}?done=1`,
      });
    } catch {
      console.error('[auth] sign-out failed', { ...authContext() });
      await this.router.navigate(['/'], { replaceUrl: true });
    }
  }
}
