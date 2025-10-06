# Marketing Assets Demo

Build campaign briefs and ad concepts with a ChatKit-driven creative workspace. This example pairs a marketing-focused FastAPI backend with a React UI so copy, imagery, and feedback stay in sync while you iterate.

## What's Inside
- FastAPI service that runs an OpenAI Agent tuned for campaign planning and stores approved assets.
- ChatKit Web Component embedded in React with a gallery panel for concepts and generated ad assets.
- Tools for generating copy, capturing image prompts, toggling themes, and persisting finished ads in real time.

## Prerequisites
- Python 3.11+
- Node.js 20+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (recommended) or `pip`
- OpenAI API key exported as `OPENAI_API_KEY`
- ChatKit domain key exported as `VITE_CHATKIT_API_DOMAIN_KEY` (any non-empty placeholder during local dev; use a real key in production)

## Quickstart Overview
1. Install dependencies and start the marketing backend.
2. Configure the domain key and launch the React frontend.
3. Generate a few campaign concepts in the demo workflow.

Each step is detailed below.

### 1. Start the FastAPI backend

The backend lives in `examples/marketing-assets/backend` and ships with its own `pyproject.toml`.

```bash
cd examples/marketing-assets/backend
uv sync
export OPENAI_API_KEY="sk-proj-..."
uv run uvicorn app.main:app --reload --port 8003
```

The API exposes ChatKit at `http://127.0.0.1:8003/chatkit` plus REST helpers under `/assets` for storing approved creative. (If your shell cannot resolve local packages, set `PYTHONPATH=$(pwd)` before running Uvicorn.)

### 2. Run the React frontend

```bash
cd examples/marketing-assets/frontend
npm install
npm run dev
```

The dev server runs at `http://127.0.0.1:5173` and proxies `/chatkit` and `/assets` requests back to the API, which is all you need for local iteration.

From the `examples/marketing-assets` directory you can also run `npm start` to launch the backend (`uv sync` + Uvicorn) and frontend together. Ensure `uv` is installed and required environment variables (for example `OPENAI_API_KEY` and the domain key) are exported before using this shortcut.

Regarding the domain public key, you can use any string during local development. However, for production deployments:

1. Host the frontend on infrastructure you control behind a managed domain.
2. Register that domain on the [domain allowlist page](https://platform.openai.com/settings/organization/security/domain-allowlist) and add it to `examples/marketing-assets/frontend/vite.config.ts` under `server.allowedHosts`.
3. Set `VITE_CHATKIT_API_DOMAIN_KEY` to the key returned by the allowlist page and confirm `examples/marketing-assets/frontend/src/lib/config.ts` picks it up (alongside any optional overrides such as `VITE_ASSETS_API_URL`).

If you want to verify remote-access behavior before launch, temporarily expose the app with a tunnel—e.g. `ngrok http 5173` or `cloudflared tunnel --url http://localhost:5173`—and allowlist that hostname first.

## 3. Try the workflow

Open the printed URL and prompt the agent with creative tasks like:

- `Draft a headline, body copy, and image prompt for a productivity app launch.`
- `Refresh our eco-friendly water bottle ad for a fall campaign.`
- `Suggest a carousel concept with three variations and matching calls to action.`

Approved concepts land in the gallery panel, and generated imagery is stored alongside each saved asset.

## Customize the demo

- **Instructions and tools**: Adjust prompt engineering or add/remove tools in `backend/app/constants.py` and `backend/app/chat.py`.
- **Asset persistence**: Swap the in-memory store in `backend/app/ad_assets.py` for your own database layer.
- **Frontend config**: Override endpoints or text in `frontend/src/lib/config.ts`, and tailor the gallery UI in `frontend/src/components`.
- **Styling**: Extend the Tailwind configuration or replace components to match your brand guidelines.
