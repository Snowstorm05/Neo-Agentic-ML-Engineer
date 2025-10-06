import { useCallback, useEffect, useRef, useState } from "react";

import type { AdAssetRecord } from "../lib/ad-assets";
import { ASSETS_API_URL } from "../lib/config";

export type AdAssetAction =
  | { type: "save"; asset: AdAssetRecord }
  | { type: "remove"; assetId: string };

export function useAdAssets() {
  const [assets, setAssets] = useState<AdAssetRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAssets = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(ASSETS_API_URL, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Failed to load assets (${response.status})`);
      }
      const payload: { assets?: AdAssetRecord[] } = await response.json();
      const incoming = Array.isArray(payload.assets) ? payload.assets : [];
      setAssets(incoming);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message ?? "Failed to load assets");
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAssets();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchAssets]);

  const performAction = useCallback(async (action: AdAssetAction) => {
    if (action.type === "save") {
      setAssets((current) => {
        const index = current.findIndex((asset) => asset.id === action.asset.id);
        if (index >= 0) {
          const next = current.slice();
          next[index] = action.asset;
          return next;
        }
        return [...current, action.asset];
      });
      return;
    }

    if (action.type === "remove") {
      setAssets((current) =>
        current.filter((asset) => asset.id !== action.assetId)
      );
    }
  }, []);

  const refresh = useCallback(() => {
    void fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refresh, performAction };
}
