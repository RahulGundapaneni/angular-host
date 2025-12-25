import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-callback',
  template: 'Signing you in...',
})
export class LoginCallbackComponent implements OnInit {
  constructor(
    @Inject(OKTA_AUTH) private readonly oktaAuth: OktaAuth,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const { tokens, state } = await this.oktaAuth.token.parseFromUrl();
      await this.oktaAuth.tokenManager.setTokens(tokens);

      const customerId = this.parseCustomerId(state);

      await this.router.navigate(['/'], {
        queryParams: customerId ? { customerId } : undefined,
        replaceUrl: true,
      });
    } catch (error) {
      await this.router.navigate(['/logout'], { replaceUrl: true });
    }
  }

  private parseCustomerId(state: unknown): string | undefined {
    if (typeof state !== 'string') {
      return undefined;
    }

    try {
      const parsed = JSON.parse(state) as { customerId?: string };
      return parsed.customerId || undefined;
    } catch {
      return undefined;
    }
  }
}
