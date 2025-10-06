from __future__ import annotations

from typing import Any, AsyncIterator

from agents import RunConfig, Runner
from agents.model_settings import ModelSettings
from chatkit.agents import AgentContext, stream_agent_response
from chatkit.server import ChatKitServer, StreamingResult
from chatkit.types import (
    Attachment,
    ClientToolCallItem,
    ThreadMetadata,
    ThreadStreamEvent,
    UserMessageItem,
)
from fastapi import Depends, FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from openai.types.responses import ResponseInputContentParam
from starlette.responses import JSONResponse

from .airline_state import AirlineStateManager, CustomerProfile
from .memory_store import MemoryStore
from .support_agent import state_manager, support_agent

DEFAULT_THREAD_ID = "demo_default_thread"


def _user_message_text(item: UserMessageItem) -> str:
    parts: list[str] = []
    for part in item.content:
        text = getattr(part, "text", None)
        if text:
            parts.append(text)
    return " ".join(parts).strip()


def _format_customer_context(profile: CustomerProfile) -> str:
    segments = []
    for segment in profile.segments:
        segments.append(
            f"- {segment.flight_number} {segment.origin}->{segment.destination}"
            f" on {segment.date} seat {segment.seat} ({segment.status})"
        )
    summary = "\n".join(segments)
    timeline = profile.timeline[:3]
    recent = "\n".join(f"  * {entry['entry']} ({entry['timestamp']})" for entry in timeline)
    return (
        "Customer Profile\n"
        f"Name: {profile.name} ({profile.loyalty_status})\n"
        f"Loyalty ID: {profile.loyalty_id}\n"
        f"Contact: {profile.email}, {profile.phone}\n"
        f"Checked Bags: {profile.bags_checked}\n"
        f"Meal Preference: {profile.meal_preference or 'Not set'}\n"
        f"Special Assistance: {profile.special_assistance or 'None'}\n"
        "Upcoming Segments:\n"
        f"{summary}\n"
        "Recent Service Timeline:\n"
        f"{recent or '  * No service actions recorded yet.'}"
    )


def _is_tool_completion_item(item: Any) -> bool:
    return isinstance(item, ClientToolCallItem)


class CustomerSupportServer(ChatKitServer[dict[str, Any]]):
    def __init__(
        self,
        agent_state: AirlineStateManager,
    ) -> None:
        store = MemoryStore()
        super().__init__(store)
        self.store = store
        self.agent_state = agent_state
        self.agent = support_agent

    def _resolve_thread_id(self, thread: ThreadMetadata | None) -> str:
        return thread.id if thread and thread.id else DEFAULT_THREAD_ID

    async def respond(
        self,
        thread: ThreadMetadata,
        item: UserMessageItem | None,
        context: dict[str, Any],
    ) -> AsyncIterator[ThreadStreamEvent]:
        if item is None:
            return

        if _is_tool_completion_item(item):
            return

        message_text = _user_message_text(item)
        if not message_text:
            return

        thread_key = self._resolve_thread_id(thread)
        profile = self.agent_state.get_profile(thread_key)
        context_prompt = _format_customer_context(profile)

        combined_prompt = (
            f"{context_prompt}\n\nCurrent request: {message_text}\n"
            "Respond as the OpenSkies concierge."
        )

        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )
        result = Runner.run_streamed(
            self.agent,
            combined_prompt,
            context=agent_context,
            run_config=RunConfig(model_settings=ModelSettings(temperature=0.4)),
        )

        async for event in stream_agent_response(agent_context, result):
            yield event

    async def to_message_content(self, _input: Attachment) -> ResponseInputContentParam:
        raise RuntimeError("File attachments are not supported in this demo.")


support_server = CustomerSupportServer(agent_state=state_manager)


app = FastAPI(title="ChatKit Customer Support API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_server() -> CustomerSupportServer:
    return support_server


@app.post("/support/chatkit")
async def chatkit_endpoint(
    request: Request, server: CustomerSupportServer = Depends(get_server)
) -> Response:
    payload = await request.body()
    result = await server.process(payload, {"request": request})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    if hasattr(result, "json"):
        return Response(content=result.json, media_type="application/json")
    return JSONResponse(result)


def _thread_param(thread_id: str | None) -> str:
    return thread_id or DEFAULT_THREAD_ID


@app.get("/support/customer")
async def customer_snapshot(
    thread_id: str | None = Query(None, description="ChatKit thread identifier"),
    server: CustomerSupportServer = Depends(get_server),
) -> dict[str, Any]:
    key = _thread_param(thread_id)
    data = server.agent_state.to_dict(key)
    return {"customer": data}


@app.get("/support/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}
