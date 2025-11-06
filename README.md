# Angular Host 2

Minimal Angular 17 shell that loads the `AgentUI` micro frontend via Module Federation. The `customerId` is read from the URL query string and forwarded to the remote.

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Angular remote in another terminal:
   ```bash
   cd ../AgentUI
   npm start
   ```
   This serves `http://localhost:4205/agentUiEntry.js`.
3. Serve this host (listens on `http://localhost:4300`):
   ```bash
   npm start
   ```
4. Open the browser and append a `customerId` query parameter, for example `http://localhost:4300/?customerId=624319`.

## How it works

- `src/main.ts` loads a manifest and provides the remote configuration through Angular DI.
- `src/app/services/agent-ui-host.service.ts` loads the remote once and exposes typed `mount`, `update`, and `unmount` helpers.
- `src/app/view/host/host.component.ts` subscribes to query-string changes, wires the remote into the DOM, and tears it down when the parameter disappears.
- `src/assets/remotes.manifest.json` can be updated per environment to point at different remote URLs.

## Scripts

- `npm start` – `ng serve --port 4300`
- `npm run build` – production build in `dist/angular-host2`
- `npm run watch` – rebuilds on change using the development configuration
- `npm test` – placeholder for unit tests
