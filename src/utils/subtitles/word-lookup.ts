import type { LangCodeISO6393, LangLevel } from "@read-frog/definitions"
import type { BackgroundTextStreamSnapshot } from "@/types/background-stream"
import { isLLMProviderConfig } from "@/types/config/provider"
import { getLocalConfig } from "@/utils/config/storage"
import { streamBackgroundText } from "@/utils/content-script/background-stream-client"
import { getSubtitleWordLookupPromptFromConfig } from "@/utils/prompts/subtitle-word-lookup"
import { resolveModelId } from "@/utils/providers/model-id"
import { getProviderOptionsWithOverride } from "@/utils/providers/options"

export interface WordLookupOptions {
  word: string
  sentence: string
  sentenceTranslation?: string
  sourceLanguage: LangCodeISO6393 | "auto"
  targetLanguage: LangCodeISO6393
  langLevel: LangLevel
  providerId: string
  signal?: AbortSignal
  onChunk?: (snapshot: BackgroundTextStreamSnapshot) => void
}

export async function streamWordLookup(options: WordLookupOptions): Promise<BackgroundTextStreamSnapshot> {
  const config = await getLocalConfig()
  if (!config) {
    throw new Error("Configuration is not available.")
  }

  const providerConfig = config.providersConfig.find(provider => provider.id === options.providerId)

  if (!providerConfig) {
    throw new Error("Word lookup provider is not configured.")
  }

  if (!providerConfig.enabled) {
    throw new Error("Word lookup provider is disabled.")
  }

  if (!isLLMProviderConfig(providerConfig)) {
    throw new Error("Word lookup requires an AI provider.")
  }

  const { provider, providerOptions: userProviderOptions, temperature } = providerConfig
  const modelName = resolveModelId(providerConfig.model)
  const providerOptions = getProviderOptionsWithOverride(modelName ?? "", provider, userProviderOptions)
  const { systemPrompt, prompt } = getSubtitleWordLookupPromptFromConfig(
    config.videoSubtitles.wordLookup.customPromptsConfig,
    options.word,
    {
      sentence: options.sentence,
      sentenceTranslation: options.sentenceTranslation,
      sourceLanguage: options.sourceLanguage,
      targetLanguage: options.targetLanguage,
      level: options.langLevel,
    },
  )

  return streamBackgroundText(
    {
      providerId: options.providerId,
      system: systemPrompt,
      prompt,
      providerOptions,
      temperature,
    },
    {
      signal: options.signal,
      onChunk: options.onChunk,
    },
  )
}
