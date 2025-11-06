import { inject, Injectable } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation-runtime';

import {
  AGENT_UI_REMOTE_CONFIG,
  AgentUiRemoteConfig,
} from '../config/agent-ui-remote.token';

type AgentUiModule = typeof import('agentUi/AgentApp');
type AgentUiProps = import('agentUi/AgentApp').AgentUiProps;

/**
 * Thin wrapper around the Agent UI remote so components can mount / update / unmount it safely.
 */
@Injectable({ providedIn: 'root' })
export class AgentUiHostService {
  private readonly config: AgentUiRemoteConfig = inject(AGENT_UI_REMOTE_CONFIG);

  private modulePromise: Promise<AgentUiModule> | null = null;

  async mount(target: HTMLElement, props: AgentUiProps): Promise<void> {
    const module = await this.ensureModule();
    await module.mountAgentUi(target, props);
  }

  async update(props: AgentUiProps): Promise<void> {
    const module = await this.ensureModule();
    module.updateAgentUi(props);
  }

  async unmount(): Promise<void> {
    if (!this.modulePromise) {
      return;
    }

    const module = await this.modulePromise;
    await module.unmountAgentUi();
    this.modulePromise = null;
  }

  private ensureModule(): Promise<AgentUiModule> {
    if (!this.modulePromise) {
      this.modulePromise = loadRemoteModule<AgentUiModule>({
        type: this.config.type,
        remoteEntry: this.config.remoteEntry,
        remoteName: this.config.remoteName,
        exposedModule: this.config.exposedModule,
      });
    }

    return this.modulePromise;
  }
}
