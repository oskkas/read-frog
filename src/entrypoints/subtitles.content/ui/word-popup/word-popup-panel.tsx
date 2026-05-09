import type { WordPopupState } from "../../atoms"
import type { LLMProviderConfig } from "@/types/config/provider"
import { i18n } from "#imports"
import { IconLoader2, IconPlayerStopFilled, IconRefresh, IconVolume, IconX } from "@tabler/icons-react"
import { useAtom, useAtomValue } from "jotai"
import { use, useCallback, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/base-ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/base-ui/select"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { ANALYTICS_SURFACE } from "@/types/analytics"
import { isLLMProviderConfig } from "@/types/config/provider"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { filterEnabledProvidersConfig } from "@/utils/config/helpers"
import { ShadowWrapperContext } from "@/utils/react-shadow-host/create-shadow-host"
import { cn } from "@/utils/styles/utils"
import { useWordPopupPosition } from "./use-word-popup-position"
import { WordPopupContent } from "./word-popup-content"

export function WordPopupPanel({
  state,
  onClose,
}: {
  state: WordPopupState
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const portalContainer = use(ShadowWrapperContext)
  const position = useWordPopupPosition(state.anchor, panelRef)
  const [videoSubtitlesConfig, setVideoSubtitlesConfig] = useAtom(configFieldsAtomMap.videoSubtitles)
  const providersConfig = useAtomValue(configFieldsAtomMap.providersConfig)
  const ttsConfig = useAtomValue(configFieldsAtomMap.tts)
  const { isFetching, isPlaying, play, stop } = useTextToSpeech(ANALYTICS_SURFACE.SUBTITLE_WORD_POPUP)

  const llmProviders = useMemo(
    () => filterEnabledProvidersConfig(providersConfig).filter(isLLMProviderConfig),
    [providersConfig],
  )
  const selectedProvider = llmProviders.find(provider => provider.id === videoSubtitlesConfig.wordLookup.providerId)

  const handleSpeak = useCallback(() => {
    if (isFetching || isPlaying) {
      stop()
      return
    }

    void play(state.word, ttsConfig)
  }, [isFetching, isPlaying, play, state.word, stop, ttsConfig])

  return (
    <div
      ref={panelRef}
      className={cn(
        "pointer-events-auto fixed max-h-[min(320px,44vh)] w-[min(400px,90vw)] overflow-hidden rounded-lg border border-white/15 bg-neutral-950/95 text-white shadow-2xl shadow-black/45 backdrop-blur-md",
        "animate-in fade-in-0 zoom-in-95 duration-150",
      )}
      style={{ top: position.top, left: position.left }}
      onClick={event => event.stopPropagation()}
    >
      <div
        className={cn(
          "absolute left-1/2 size-3 -translate-x-1/2 rotate-45 border-white/15 bg-neutral-950/95",
          position.placement === "above"
            ? "-bottom-1.5 border-b border-r"
            : "-top-1.5 border-l border-t",
        )}
      />

      <div className="relative flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold leading-tight">{state.word}</div>
          <div className="truncate text-[11px] text-white/50">{state.sentence}</div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0 text-white/75 hover:bg-white/10 hover:text-white"
          aria-label={isPlaying ? i18n.t("action.playing") : i18n.t("action.speak")}
          onClick={handleSpeak}
        >
          {isFetching
            ? <IconLoader2 className="size-4 animate-spin" />
            : isPlaying
              ? <IconPlayerStopFilled className="size-4" />
              : <IconVolume className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0 text-white/75 hover:bg-white/10 hover:text-white"
          aria-label="Regenerate"
          onClick={() => setRefreshKey(key => key + 1)}
        >
          <IconRefresh className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0 text-white/75 hover:bg-white/10 hover:text-white"
          aria-label="Close"
          onClick={onClose}
        >
          <IconX className="size-4" />
        </Button>
      </div>

      <div className="max-h-[210px] overflow-y-auto px-3 py-3 text-neutral-100">
        <WordPopupContent refreshKey={refreshKey} state={state} />
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 px-3 py-2">
        <span className="text-[11px] text-white/45">Provider</span>
        <Select<LLMProviderConfig>
          value={selectedProvider}
          itemToStringValue={provider => provider.id}
          onValueChange={(provider) => {
            if (!provider) {
              return
            }

            void setVideoSubtitlesConfig({
              ...videoSubtitlesConfig,
              wordLookup: {
                ...videoSubtitlesConfig.wordLookup,
                providerId: provider.id,
              },
            })
          }}
          disabled={llmProviders.length === 0}
        >
          <SelectTrigger size="sm" className="h-7 min-w-0 flex-1 border-white/10 bg-white/5 text-[12px] text-white hover:bg-white/10">
            <SelectValue placeholder="No AI provider">
              {provider => provider.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent container={portalContainer} className="z-2147483647">
            <SelectGroup>
              {llmProviders.map(provider => (
                <SelectItem key={provider.id} value={provider}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
