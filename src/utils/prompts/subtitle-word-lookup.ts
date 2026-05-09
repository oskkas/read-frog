import type { LangCodeISO6393, LangLevel } from "@read-frog/definitions"
import type { TranslatePromptResult } from "./translate"
import type { CustomPromptsConfig } from "@/types/config/translate"
import { LANG_CODE_TO_EN_NAME } from "@read-frog/definitions"
import {
  DEFAULT_SUBTITLE_WORD_LOOKUP_PROMPT,
  DEFAULT_SUBTITLE_WORD_LOOKUP_SYSTEM_PROMPT,
  getTokenCellText,
  INPUT,
  LEVEL,
  SENTENCE,
  SENTENCE_TRANSLATION,
  SOURCE_LANGUAGE,
  TARGET_LANGUAGE,
} from "@/utils/constants/prompt"
import { resolvePromptReplacementValue } from "./translate"

export interface SubtitleWordLookupPromptContext {
  sentence: string
  sentenceTranslation?: string
  sourceLanguage: LangCodeISO6393 | "auto"
  targetLanguage: LangCodeISO6393
  level: LangLevel
}

export function getSubtitleWordLookupPromptFromConfig(
  customPromptsConfig: CustomPromptsConfig,
  word: string,
  context: SubtitleWordLookupPromptContext,
): TranslatePromptResult {
  const { patterns = [], promptId } = customPromptsConfig
  const customPrompt = promptId ? patterns.find(pattern => pattern.id === promptId) : undefined

  const sourceLanguageName = context.sourceLanguage === "auto"
    ? "the subtitle language"
    : LANG_CODE_TO_EN_NAME[context.sourceLanguage]
  const targetLanguageName = LANG_CODE_TO_EN_NAME[context.targetLanguage]

  const replacements = {
    [TARGET_LANGUAGE]: targetLanguageName,
    [INPUT]: word,
    [SENTENCE]: resolvePromptReplacementValue(context.sentence, "No sentence available"),
    [SENTENCE_TRANSLATION]: resolvePromptReplacementValue(context.sentenceTranslation, "No sentence translation available"),
    [SOURCE_LANGUAGE]: sourceLanguageName,
    [LEVEL]: context.level,
  }

  const replaceTokens = (text: string) =>
    Object.entries(replacements).reduce(
      (result, [token, value]) => result.replaceAll(getTokenCellText(token), value),
      text,
    )

  return {
    systemPrompt: replaceTokens(customPrompt?.systemPrompt ?? DEFAULT_SUBTITLE_WORD_LOOKUP_SYSTEM_PROMPT),
    prompt: replaceTokens(customPrompt?.prompt ?? DEFAULT_SUBTITLE_WORD_LOOKUP_PROMPT),
  }
}
