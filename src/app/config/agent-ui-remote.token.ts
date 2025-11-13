import { InjectionToken } from '@angular/core';
import type { loadRemoteModule } from '@angular-architects/module-federation-runtime';

type RemoteType = 'script' | 'module';

export interface AgentUiRemoteConfig {
  remoteName: string;
  exposedModule: string;
  remoteEntry: string;
  type: RemoteType;
}

export const AGENT_UI_REMOTE_CONFIG = new InjectionToken<AgentUiRemoteConfig>(
  'AGENT_UI_REMOTE_CONFIG',
);

export type AgentUiRemoteLoader = typeof loadRemoteModule;

export const AGENT_UI_REMOTE_LOADER = new InjectionToken<AgentUiRemoteLoader>(
  'AGENT_UI_REMOTE_LOADER',
);
