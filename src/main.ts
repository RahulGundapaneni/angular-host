import { initFederation } from '@angular-architects/module-federation-runtime';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import {
  AGENT_UI_REMOTE_CONFIG,
  AgentUiRemoteConfig,
} from './app/config/agent-ui-remote.token';
import { environment } from './environments/environment';

interface RemoteManifestEntry {
  entry: string;
  type?: 'script' | 'module';
}

type RemoteManifest = Record<string, RemoteManifestEntry>;

const FALLBACK_MANIFEST: RemoteManifest = {
  agentUi: {
    entry: environment.agentUiFallbackEntry,
    type: environment.agentUiFallbackType,
  },
};

function buildAssetUrl(path: string): string {
  const baseHref = document.baseURI ?? window.location.origin;
  return new URL(path, baseHref).toString();
}

async function loadRemoteManifest(): Promise<RemoteManifest> {
  const manifestUrl = buildAssetUrl('assets/remotes.manifest.json');

  try {
    const response = await fetch(manifestUrl, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Manifest request failed with status ${response.status}`);
    }

    return (await response.json()) as RemoteManifest;
  } catch (error) {
    console.warn(
      `Falling back to default Module Federation manifest because ${manifestUrl} could not be loaded.`,
      error,
    );
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
