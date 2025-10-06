"""In-memory store for generated ad assets."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Iterable, List, Sequence
from uuid import uuid4


@dataclass(slots=True)
class AdAsset:
    """Represents a single generated ad concept."""

    product: str
    style: str
    tone: str
    pitch: str
    headline: str
    primary_text: str
    call_to_action: str
    image_prompts: List[str]
    images: List[str] = field(default_factory=list)
    id: str = field(default_factory=lambda: f"asset_{uuid4().hex[:8]}")
    created_at: datetime = field(default_factory=datetime.utcnow)

    def as_dict(self) -> dict[str, object]:
        """Serialize the ad asset for JSON responses or client payloads."""

        return {
            "id": self.id,
            "product": self.product,
            "style": self.style,
            "tone": self.tone,
            "pitch": self.pitch,
            "headline": self.headline,
            "primaryText": self.primary_text,
            "callToAction": self.call_to_action,
            "imagePrompts": list(self.image_prompts),
            "images": list(self.images),
            "createdAt": self.created_at.isoformat(),
        }


class AdAssetStore:
    """Thread-safe helper that stores ad assets in memory."""

    def __init__(self) -> None:
        self._assets: Dict[str, AdAsset] = {}
        self._order: List[str] = []
        self._lock = asyncio.Lock()

    async def create(
        self,
        *,
        product: str,
        style: str,
        tone: str,
        pitch: str,
        headline: str,
        primary_text: str,
        call_to_action: str,
        image_prompts: Sequence[str],
        images: Sequence[str] | None = None,
        asset_id: str | None = None,
    ) -> AdAsset:
        """Persist or update a generated ad asset and return it."""

        async with self._lock:
            if asset_id and asset_id in self._assets:
                asset = self._assets[asset_id]
                asset.product = product
                asset.style = style
                asset.tone = tone
                asset.pitch = pitch
                asset.headline = headline
                asset.primary_text = primary_text
                asset.call_to_action = call_to_action
                asset.image_prompts = list(image_prompts)
                if images is not None:
                    asset.images = list(images)
                return asset

            asset = AdAsset(
                product=product,
                style=style,
                tone=tone,
                pitch=pitch,
                headline=headline,
                primary_text=primary_text,
                call_to_action=call_to_action,
                image_prompts=list(image_prompts),
                images=list(images or []),
            )
            if asset_id:
                asset.id = asset_id
            self._assets[asset.id] = asset
            if asset.id not in self._order:
                self._order.append(asset.id)
            return asset

    async def list_saved(self) -> List[AdAsset]:
        """Return saved ad assets in insertion order."""

        async with self._lock:
            return [self._assets[asset_id] for asset_id in self._order]

    async def get(self, asset_id: str) -> AdAsset | None:
        async with self._lock:
            return self._assets.get(asset_id)

    async def iter_all(self) -> Iterable[AdAsset]:
        async with self._lock:
            return [self._assets[asset_id] for asset_id in self._order]

    async def append_image(self, asset_id: str, image: str) -> AdAsset | None:
        async with self._lock:
            asset = self._assets.get(asset_id)
            if asset is None:
                return None
            if image not in asset.images:
                asset.images.append(image)
            return asset


ad_asset_store = AdAssetStore()
"""Global instance used by the API and the ChatKit workflow."""
