import { OktaAuth } from '@okta/okta-auth-js';

import { environment } from '../../environments/environment';

export const oktaAuth = new OktaAuth({
  issuer: environment.auth.issuer,
  clientId: environment.auth.clientId,
  redirectUri: environment.auth.redirectUri,
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
});
