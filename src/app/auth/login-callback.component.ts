import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

import { authContext } from './logging.util';

@Component({
  selector: 'app-login-callback',
  templateUrl: './login-callback.component.html',
  styleUrls: ['./login-callback.component.scss'],
})
export class LoginCallbackComponent implements OnInit {
  constructor(
    @Inject(OKTA_AUTH) private readonly oktaAuth: OktaAuth,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    void this.handleLoginCallback();
  }

  protected async handleLoginCallback(): Promise<void> {
    try {
      const { tokens, state } = await this.oktaAuth.token.parseFromUrl();
      console.info('[auth] token parse success', {
        ...authContext(),
        idToken: tokens.idToken ? 'present' : 'missing',
        accessToken: tokens.accessToken ? 'present' : 'missing',
      });
      await this.oktaAuth.tokenManager.setTokens(tokens);

      const customerId = this.parseCustomerId(state);

      await this.router.navigate(['/'], {
        queryParams: customerId ? { customerId } : undefined,
        replaceUrl: true,
      });
    } catch (error) {
      console.error('[auth] token parse failed', { ...authContext(), error });
      await this.router.navigate(['/logout'], { replaceUrl: true });
    }
  }

  private parseCustomerId(state: unknown): string | undefined {
    if (typeof state !== 'string') {
      return undefined;
    }

    try {
      const parsed = JSON.parse(state);
      const customerId =
        parsed && typeof parsed === 'object' && 'customerId' in parsed
          ? (parsed as { customerId?: unknown }).customerId
          : undefined;

      return typeof customerId === 'string' && customerId.trim()
        ? customerId.trim()
        : undefined;
    } catch (error) {
      console.warn('Ignoring malformed Okta state payload', error);
      return undefined;
    }
  }
}
