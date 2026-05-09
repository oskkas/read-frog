import type { CustomPromptsConfig } from "@/components/prompt-configurator"
import { atom } from "jotai"
import { configFieldsAtomMap } from "@/utils/atoms/config"

const wordLookupPromptConfigAtom = atom(
  get => get(configFieldsAtomMap.videoSubtitles).wordLookup.customPromptsConfig,
  (get, set, customPromptsConfig: CustomPromptsConfig) => {
    const videoSubtitles = get(configFieldsAtomMap.videoSubtitles)
    void set(configFieldsAtomMap.videoSubtitles, {
      ...videoSubtitles,
      wordLookup: {
        ...videoSubtitles.wordLookup,
        customPromptsConfig,
      },
    })
  },
)

export const promptAtoms = {
  config: wordLookupPromptConfigAtom,
  exportMode: atom(false),
  selectedPrompts: atom<string[]>([]),
}
