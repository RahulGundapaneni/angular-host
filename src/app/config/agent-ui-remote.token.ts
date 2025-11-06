import { InjectionToken } from '@angular/core';

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
