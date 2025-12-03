# Angular Host Demo

Use this single page as the source of truth when walking someone through how the Angular host loads the AgentUI micro frontend with Module Federation.

## Essentials
- **Bootstrap (`src/main.ts`)** – fetches `assets/remotes.manifest.json`, calls `initFederation`, and registers the resolved config through the `AGENT_UI_REMOTE_CONFIG` token.
- **Host service (`src/app/services/agent-ui-host.service.ts`)** – lazy-loads `agentUi/AgentApp`, caches the module, and exposes typed `mount`, `update`, and `unmount` helpers.
- **Host view (`src/app/view/host/host.component.ts` + `.html`)** – listens to `ActivatedRoute.queryParamMap`, pushes the `customerId` prop into the remote, and tears it down when the param disappears.
- **Manifest (`src/assets/remotes.manifest.json`)** – swaps the remote URL per environment without rebuilding; falls back to `environment.agentUiFallbackEntry` if missing.

## Run It
1. Terminal A – `cd ../AgentUI && npm install && npm start` (serves `http://localhost:4205/agentUiEntry.js`).
2. Terminal B – `cd angular-host && npm install && npm start` (serves `http://localhost:4300`).

## Demo Flow
1. **Bootstrap** – open `src/main.ts`, highlight the manifest fetch, the fallback logic, and `initFederation` + DI wiring.
2. **Manifest** – show `src/assets/remotes.manifest.json`; mention editing it (or stopping the remote) to see the fallback defined in `src/environments/environment.ts`.
3. **Host view** – point to the minimal template (`<div #remoteOutlet>`) to emphasize that the remote owns the UI; change `customerId` in the URL to show `update` versus `mount`.
4. **Teardown** – remove the parameter to trigger `unmount` and confirm the placeholder DOM stays for future mounts.

## Troubleshooting
- Remote 404 / network error → confirm the manifest entry or fallback URL.
- Nothing renders → ensure `?customerId=` exists; the host intentionally avoids mounting without it.
- Contract drift → update the shared `AgentUiProps` typings in the AgentUI repo and regenerate types if needed.
