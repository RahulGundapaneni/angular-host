import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-logout',
  template: 'Signing you out...',
})
export class LogoutComponent implements OnInit {
  constructor(
    @Inject(OKTA_AUTH) private readonly oktaAuth: OktaAuth,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.oktaAuth.signOut({
        postLogoutRedirectUri: environment.auth.postLogoutRedirectUri,
      });
    } catch {
      await this.router.navigate(['/'], { replaceUrl: true });
    }
  }
}
