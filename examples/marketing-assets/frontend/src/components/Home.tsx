import clsx from "clsx";

import { ChatKitPanel } from "./ChatKitPanel";
import { AdAssetCard } from "./AdAssetCard";
import { ThemeToggle } from "./ThemeToggle";
import { ColorScheme } from "../hooks/useColorScheme";
import { useAdAssets } from "../hooks/useAdAssets";

export default function Home({
  scheme,
  handleThemeChange,
}: {
  scheme: ColorScheme;
  handleThemeChange: (scheme: ColorScheme) => void;
}) {
  const { assets, refresh, performAction } = useAdAssets();

  const containerClass = clsx(
    "min-h-screen bg-gradient-to-br transition-colors duration-300",
    scheme === "dark"
      ? "from-slate-900 via-slate-950 to-slate-850 text-slate-100"
      : "from-slate-100 via-white to-slate-200 text-slate-900"
  );

  return (
    <div className={containerClass}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 pt-4 pb-12 md:py-10 lg:flex-row lg:items-start">
        <aside className="sticky top-10 hidden h-[88vh] w-full max-w-md flex-none overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.6)] ring-1 ring-slate-200/60 backdrop-blur dark:bg-slate-900 dark:ring-slate-800 lg:block">
          <ChatKitPanel
            theme={scheme}
            onAssetAction={performAction}
            onResponseEnd={refresh}
            onThemeRequest={handleThemeChange}
          />
        </aside>

        <main className="relative flex-1">
          <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold sm:text-4xl">
                Ad generation helper
              </h1>
              <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Brief the assistant using the chat pinned on the left. Every approved concept appears here with copy, prompts, and visuals ready for reuse.
              </p>
            </div>
            <ThemeToggle value={scheme} onChange={handleThemeChange} />
          </div>
        </header>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Generated assets
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select an asset to review the copy, image prompts, and any generated imagery.
          </p>
          <div className="mt-6">
            <div className="rounded-3xl border border-slate-200/60 bg-white/75 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.42)] ring-1 ring-slate-200/50 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/55 dark:shadow-[0_45px_95px_-60px_rgba(15,23,42,0.85)] dark:ring-slate-900/60">
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {assets.length === 0 ? (
                  <div className="flex flex-col items-start gap-3 text-slate-600 dark:text-slate-300">
                    <span className="text-base font-medium text-slate-700 dark:text-slate-200">
                      No assets yet.
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Share a brief in the chat to generate your first concept.
                    </span>
                  </div>
                ) : (
                  <ul className="grid gap-4">
                    {assets.map((asset) => (
                      <AdAssetCard key={asset.id} asset={asset} />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
        </main>
      </div>
    </div>
  );
}
