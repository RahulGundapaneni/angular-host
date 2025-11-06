import { initFederation } from '@angular-architects/module-federation-runtime';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import {
  AGENT_UI_REMOTE_CONFIG,
  AgentUiRemoteConfig,
} from './app/config/agent-ui-remote.token';

interface RemoteManifestEntry {
  entry: string;
  type?: 'script' | 'module';
}

type RemoteManifest = Record<string, RemoteManifestEntry>;

const FALLBACK_MANIFEST: RemoteManifest = {
  agentUi: {
    entry: 'http://localhost:4205/agentUiEntry.js',
    type: 'script',
  },
};

async function loadRemoteManifest(): Promise<RemoteManifest> {
  try {
    const response = await fetch('/assets/remotes.manifest.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Manifest request failed with status ${response.status}`);
    }

    return (await response.json()) as RemoteManifest;
  } catch (error) {
    console.warn('Falling back to default Module Federation manifest.', error);
    return FALLBACK_MANIFEST;
  }
}

function createAgentUiConfig(manifest: RemoteManifest): AgentUiRemoteConfig {
  const entry = manifest['agentUi'] ?? FALLBACK_MANIFEST['agentUi'];

  return {
    remoteName: 'agentUi',
    exposedModule: './AgentApp',
    remoteEntry: entry.entry,
    type: entry.type === 'module' ? 'module' : 'script',
  } satisfies AgentUiRemoteConfig;
}

async function bootstrap(): Promise<void> {
  const manifest = await loadRemoteManifest();
  const agentUiConfig = createAgentUiConfig(manifest);

  await initFederation({
    [agentUiConfig.remoteName]: {
      type: agentUiConfig.type,
      remoteEntry: agentUiConfig.remoteEntry,
    },
  });

  await platformBrowserDynamic([
    { provide: AGENT_UI_REMOTE_CONFIG, useValue: agentUiConfig },
  ]).bootstrapModule(AppModule);
}

bootstrap().catch((error) => console.error('Failed to bootstrap Angular host', error));
