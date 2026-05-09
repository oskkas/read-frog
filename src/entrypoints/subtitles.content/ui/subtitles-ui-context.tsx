import type { ControlsConfig } from "@/entrypoints/subtitles.content/platforms"
import type { UniversalVideoAdapter } from "@/entrypoints/subtitles.content/universal-adapter"
import { QueryClientProvider } from "@tanstack/react-query"
import { Provider as JotaiProvider } from "jotai"
import { createContext, use } from "react"
import { queryClient } from "@/utils/tanstack-query"
import { subtitlesStore } from "../atoms"

interface SubtitlesUIContextValue {
  toggleSubtitles: (enabled: boolean) => void
  downloadSourceSubtitles: () => Promise<void>
  controlsConfig?: ControlsConfig
  embedded?: boolean
}

export const SubtitlesUIContext = createContext<SubtitlesUIContextValue | null>(null)

export function useSubtitlesUI() {
  const ui = use(SubtitlesUIContext)
  if (!ui) {
    throw new Error("useSubtitlesUI must be used within SubtitlesUIContext")
  }
  return ui
}

export type SubtitlesProvidersAdapter = Pick<
  UniversalVideoAdapter,
  "downloadSourceSubtitles" | "embedded" | "getControlsConfig" | "toggleSubtitlesManually"
>

export function SubtitlesProviders({
  adapter,
  children,
}: {
  adapter: SubtitlesProvidersAdapter
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={subtitlesStore}>
        <SubtitlesUIContext
          value={{
            toggleSubtitles: adapter.toggleSubtitlesManually,
            downloadSourceSubtitles: adapter.downloadSourceSubtitles,
            controlsConfig: adapter.getControlsConfig(),
            embedded: adapter.embedded,
          }}
        >
          {children}
        </SubtitlesUIContext>
      </JotaiProvider>
    </QueryClientProvider>
  )
}
