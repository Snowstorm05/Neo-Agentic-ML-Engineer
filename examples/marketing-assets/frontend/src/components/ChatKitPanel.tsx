import { useCallback, useRef, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import {
  CHATKIT_API_URL,
  CHATKIT_API_DOMAIN_KEY,
  STARTER_PROMPTS,
  PLACEHOLDER_INPUT,
  GREETING,
} from "../lib/config";
import type { AdAssetAction } from "../hooks/useAdAssets";
import type { ColorScheme } from "../hooks/useColorScheme";

type ChatKitPanelProps = {
  theme: ColorScheme;
  onAssetAction: (action: AdAssetAction) => Promise<void>;
  onResponseEnd: () => void;
  onThemeRequest: (scheme: ColorScheme) => void;
};

export function ChatKitPanel({
  theme,
  onAssetAction,
  onResponseEnd,
  onThemeRequest,
}: ChatKitPanelProps) {
  const processedAssets = useRef(new Set<string>());
  const [composerPlaceholder, setComposerPlaceholder] =
    useState(PLACEHOLDER_INPUT);
  const BUSY_PLACEHOLDER = "Hang tight, the helper is responding…";

  const setBusy = useCallback((busy: boolean) => {
    setComposerPlaceholder(busy ? BUSY_PLACEHOLDER : PLACEHOLDER_INPUT);
  }, []);

  const chatkit = useChatKit({
    api: { url: CHATKIT_API_URL, domainKey: CHATKIT_API_DOMAIN_KEY },
    theme,
    header: {},
    startScreen: {
      greeting: GREETING,
      prompts: STARTER_PROMPTS,
    },
    onLog: ({ name }) => {
      if (typeof name === "string" && name === "start_screen.prompt.select") {
        setBusy(true);
      }
    },
    composer: {
      placeholder: composerPlaceholder,
      attachments: {
        enabled: false,
      },
    },
    onClientTool: async (invocation) => {
      if (invocation.name === "switch_theme") {
        const requested = invocation.params.theme;
        if (requested === "light" || requested === "dark") {
          onThemeRequest(requested);
          return { success: true };
        }
        return { success: false };
      }
      if (invocation.name === "record_ad_asset") {
        const asset = invocation.params.assets as any;
        if (!asset?.id || processedAssets.current.has(asset.id)) {
          return { success: true } as const;
        }
        processedAssets.current.add(asset.id);
        void onAssetAction({ type: "save", asset });
        return { success: true };
      }
      return { success: false };
    },
    onResponseStart: () => {
      setBusy(true);
    },
    onResponseEnd: () => {
      setBusy(false);
      onResponseEnd();
    },
    onThreadChange: ({ threadId }: { threadId: string | null }) => {
      processedAssets.current.clear();
      setBusy(false);
    },
    onError: ({ error }) => {
      // ChatKit surfaces the error in the UI; we only log for debugging.
      console.error("ChatKit error", error);
      setBusy(false);
    },
  });

  return (
    <div className="relative h-full w-full overflow-hidden border border-slate-200/60 bg-white shadow-card dark:border-slate-800/70 dark:bg-slate-900">
      <div className="pointer-events-none absolute left-5 top-5 z-10 rounded-full border border-slate-200/60 bg-white/85 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300">
        Ad generation helper
      </div>
      <ChatKit control={chatkit.control} className="block h-full w-full" />
    </div>
  );
}
