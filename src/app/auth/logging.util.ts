import { environment } from '../../environments/environment';

export function maskClientId(clientId?: string): string {
  if (!clientId) {
    return 'n/a';
  }

  if (clientId.length <= 4) {
    return '***';
  }

  const visible = clientId.slice(-4);
  return `${'*'.repeat(clientId.length - 4)}${visible}`;
}

export function authContext(): Record<string, string> {
  return {
    issuer: environment.auth.issuer,
    clientId: maskClientId(environment.auth.clientId),
    redirectUri: environment.auth.redirectUri,
    postLogoutRedirectUri: environment.auth.postLogoutRedirectUri,
  };
}
