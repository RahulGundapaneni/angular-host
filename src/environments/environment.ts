export const environment = {
  production: false,
  apiBaseUrl: '/api',
  agentUiFallbackEntry: 'http://localhost:4205/agentUiEntry.js',
  agentUiFallbackType: 'script' as const,
  auth: {
    issuer: 'https://YOUR_OKTA_DOMAIN.okta.com/oauth2/default',
    clientId: 'YOUR_CLIENT_ID',
    redirectUri: 'http://localhost:4300/login',
    postLogoutRedirectUri: 'http://localhost:4300/logout',
  },
} as const;
