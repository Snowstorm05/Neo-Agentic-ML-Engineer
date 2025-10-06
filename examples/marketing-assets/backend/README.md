# Marketing Assets Backend

Marketing teams can iterate on campaign copy and imagery with this FastAPI service powering the ChatKit marketing demo. It streams agent responses tailored for creative briefs and exposes REST helpers so the frontend can persist approved assets.

## What's Inside

- ChatKit server (`POST /chatkit`) that streams ad concepts, theme toggles, and other agent-driven actions.
- Tools that capture headlines, body copy, calls to action, and image prompts directly from the conversation.
- In-memory store for assets located in `app/ad_assets.py` (swap with your own persistence layer as needed).
- REST endpoint under `/assets` for listing saved creative.

## Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (recommended) or `pip`
- OpenAI API key exported as `OPENAI_API_KEY`

## Quickstart

```bash
cd examples/marketing-assets/backend
uv sync
export OPENAI_API_KEY="sk-proj-..."
uv run uvicorn app.main:app --reload --port 8003
```

The API listens on `http://127.0.0.1:8003`. If your environment requires it, set `PYTHONPATH=$(pwd)` before running Uvicorn so the local `app` package resolves.

## Key Modules
- `app/chat.py` – ChatKit server wiring, agent definition, and tool handlers.
- `app/ad_assets.py` – Data model plus in-memory store for generated ads.
- `app/main.py` – FastAPI entry point exposing ChatKit and REST endpoints.

## Next Steps
- Replace the in-memory stores with your database.
- Update guardrails or agent instructions in `app/constants.py`.
- Add new tools for approvals, handoffs, or analytics integrations.
