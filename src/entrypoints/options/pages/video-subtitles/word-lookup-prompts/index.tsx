import { i18n } from "#imports"
import { PromptConfigurator } from "@/components/prompt-configurator"
import { getTokenCellText, SUBTITLE_WORD_LOOKUP_PROMPT_TOKENS } from "@/utils/constants/prompt"
import { promptAtoms } from "./atoms"

export function WordLookupPrompts() {
  const insertCells = SUBTITLE_WORD_LOOKUP_PROMPT_TOKENS.map(token => ({
    text: getTokenCellText(token),
    description: i18n.t(`options.videoSubtitles.wordLookup.customPrompts.editPrompt.promptCellInput.${token}` as never),
  }))

  return (
    <PromptConfigurator
      id="subtitle-word-lookup-prompts"
      promptAtoms={promptAtoms}
      insertCells={insertCells}
      title={i18n.t("options.videoSubtitles.wordLookup.customPrompts.title")}
      description={i18n.t("options.videoSubtitles.wordLookup.customPrompts.description")}
    />
  )
}
