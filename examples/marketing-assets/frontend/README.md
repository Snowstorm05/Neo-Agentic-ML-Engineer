# Marketing Assets Frontend

This Vite + React app renders the marketing workspace for the ChatKit demo. The chat panel drives the conversation while the right-hand gallery tracks approved copy, prompts, and generated ad summaries.

## Highlights
- Wraps the `<openai-chatkit>` web component with custom panels for campaign briefs and asset previews.
- Persists theme selection locally and forwards changes to ChatKit so the UI stays in sync.
- Displays approved concepts as soon as the backend streams an update.

## Prerequisites
- Node.js 20+
- ChatKit domain key exported as `VITE_CHATKIT_API_DOMAIN_KEY` (placeholder during local dev; real key for production)
- Backend service from `examples/marketing-assets/backend` running locally (or reachable via tunnel)

## Local Development

1. Ensure the backend is running at `http://127.0.0.1:8003` or update `BACKEND_URL` when starting Vite.
2. Export any non-empty string for local development so Vite can inject it:
   ```bash
   export VITE_CHATKIT_API_DOMAIN_KEY=domain_pk_local_dev
   ```
   When you deploy, register your public domain and replace the placeholder with the generated `domain_pk_...` key from the allowlist UI.
3. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

Vite proxies `/chatkit` and `/assets` requests to the backend, which is enough for localhost development. To test remote access, you can temporarily expose the Vite port on a publicly reachable host (e.g. `ngrok http 5173`) after adding that hostname to `server.allowedHosts` in `vite.config.ts`. For production, host the app on infrastructure you control behind a managed domain, register that domain on the [domain allowlist page](https://platform.openai.com/settings/organization/security/domain-allowlist) and mirror it in `examples/marketing-assets/frontend/vite.config.ts` under `server.allowedHosts`, then set the resulting key via `VITE_CHATKIT_API_DOMAIN_KEY`.

## Environment Overrides
- `VITE_CHATKIT_API_URL` – point the chat component at a different endpoint.
- `VITE_ASSETS_API_URL` – change the REST base for saved concepts.
- `BACKEND_URL` – update the proxy target without editing `vite.config.ts`.

## Project Structure
- `src/App.tsx` – top-level layout combining ChatKit with the gallery.
- `src/components/` – panels for briefs and saved assets.
- `src/lib/config.ts` – central place for environment-driven configuration.

Tailor the components, styling, and prompts to match your brand experience once the base integration is running.
