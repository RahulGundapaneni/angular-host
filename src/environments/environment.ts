export const environment = {
  production: false,
  apiBaseUrl: '/api',
  agentUiFallbackEntry: 'http://localhost:4205/agentUiEntry.js',
  agentUiFallbackType: 'script' as const,
} as const;
