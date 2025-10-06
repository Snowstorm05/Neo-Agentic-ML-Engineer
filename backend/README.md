# ChatKit Python Backend

> For the steps to run both fronend and backend apps in this repo, please refer to the README.md at the top directory insteaad.

This FastAPI service wires up a minimal ChatKit server implementation with a single tool capable of recording short facts that users share in the conversation. Facts that are saved through the widget are exposed via the `/facts` REST endpoint so the frontend can render them alongside the chat experience.

## Features

- **ChatKit endpoint** at `POST /chatkit` that streams responses using the ChatKit protocol when the optional ChatKit Python package is installed.
- **Fact recording tool** that renders a confirmation widget with _Save_ and _Discard_ actions.
- **Guardrail-ready system prompt** extracted into `app/constants.py` so it is easy to modify.
- **Simple fact store** backed by in-memory storage in `app/facts.py`.
- **REST helpers**
  - `GET  /facts` – list saved facts (used by the frontend list view)
  - `POST /facts/{fact_id}/save` – mark a fact as saved
  - `POST /facts/{fact_id}/discard` – discard a pending fact
  - `GET  /health` – surface a basic health indicator

## Getting started

To enable the realtime assistant you need to install both the ChatKit Python package and the OpenAI SDK, then provide an `OPENAI_API_KEY` environment variable.

```bash
uv sync
export OPENAI_API_KEY=sk-proj-...
uv run uvicorn app.main:app --reload
```
