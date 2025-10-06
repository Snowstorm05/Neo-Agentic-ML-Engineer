# ChatKit Integration Guide

This document explains how to customize the ChatKit starter template that lives in this repository. It covers the React client wrapper, the server-side integration that powers agent responses, and the widgets/actions system that unlocks richer UI. The goal is to keep everything you need in one place so you can ship quickly without hunting through code comments.

---

## Quick Reference
- **Frontend entry point**: `frontend/src/main.tsx`
- **ChatKit config helper**: `frontend/src/lib/config.ts`
- **FastAPI entry point**: `backend/app/main.py`

---

## Prerequisites
- Node.js 20+
- Python 3.11+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (recommended) or `pip`
- OpenAI API key exported as `OPENAI_API_KEY`
- ChatKit domain key exported as `VITE_CHATKIT_API_DOMAIN_KEY` (any non-empty placeholder during local dev; use the real key from the allowlist in production)

---

## Local Project Setup

1. **Backend**
   ```bash
   cd backend
   uv sync
   export OPENAI_API_KEY="sk-proj-..."
   uv run uvicorn app.main:app --reload --port 8000
   ```
   The API listens on `http://127.0.0.1:8000`.

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The Vite server listens on `http://127.0.0.1:5170`.

3. **Domain allowlisting**
   - For local development, export any non-empty string so the SDK sees a key:
     ```bash
     export VITE_CHATKIT_API_DOMAIN_KEY=domain_pk_local_dev
     ```
   - When deploying, register your dev or production domain at [platform.openai.com/settings/organization/security/domain-allowlist](https://platform.openai.com/settings/organization/security/domain-allowlist) and replace the placeholder with the generated `domain_pk_...` value.
   - Mirror the domain inside `frontend/vite.config.ts` by adding it to `server.allowedHosts`.
