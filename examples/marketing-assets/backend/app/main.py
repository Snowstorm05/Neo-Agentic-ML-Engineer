"""FastAPI entrypoint wiring the ChatKit server and REST endpoints."""

from __future__ import annotations

import logging
from typing import Any

from chatkit.server import StreamingResult
from fastapi import Depends, FastAPI, Request
from fastapi.responses import Response, StreamingResponse
from starlette.responses import JSONResponse

from .ad_assets import ad_asset_store
from .chat import AdCreativeServer, create_chatkit_server

app = FastAPI(title="ChatKit API")

_chatkit_server: AdCreativeServer = create_chatkit_server()


# If you want to check what's going on under the hood, set this to DEBUG
logging.basicConfig(level=logging.INFO)


logger = logging.getLogger(__name__)


def get_chatkit_server() -> AdCreativeServer:
    return _chatkit_server


@app.post("/chatkit")
async def chatkit_endpoint(
    request: Request, server: AdCreativeServer = Depends(get_chatkit_server)
) -> Response:
    payload = await request.body()
    result = await server.process(payload, {"request": request})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    if hasattr(result, "json"):
        return Response(content=result.json, media_type="application/json")
    return JSONResponse(result)


@app.get("/assets")
async def list_assets() -> dict[str, Any]:
    assets = await ad_asset_store.list_saved()
    return {"assets": [asset.as_dict() for asset in assets]}


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}
