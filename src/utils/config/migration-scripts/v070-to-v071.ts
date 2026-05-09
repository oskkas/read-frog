/**
 * Migration script from v070 to v071
 * - Adds clickable subtitle word lookup settings.
 *
 * IMPORTANT: All values are hardcoded inline. Migration scripts are frozen
 * snapshots — never import constants or helpers that may change.
 */

const LLM_PROVIDER_TYPES = [
  "openai",
  "deepseek",
  "google",
  "anthropic",
  "xai",
  "openai-compatible",
  "siliconflow",
  "tensdaq",
  "ai302",
  "bedrock",
  "groq",
  "deepinfra",
  "mistral",
  "togetherai",
  "cohere",
  "fireworks",
  "cerebras",
  "replicate",
  "perplexity",
  "vercel",
  "openrouter",
  "ollama",
  "volcengine",
  "minimax",
  "alibaba",
  "moonshotai",
  "huggingface",
]

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isLLMProvider(provider: any): boolean {
  return typeof provider === "string" && LLM_PROVIDER_TYPES.includes(provider)
}

function findWordLookupProviderId(config: any): string {
  const subtitleProviderId = config?.videoSubtitles?.providerId
  const providersConfig = Array.isArray(config?.providersConfig) ? config.providersConfig : []
  const subtitleProvider = providersConfig.find((provider: any) => provider?.id === subtitleProviderId)

  if (subtitleProvider?.enabled !== false && isLLMProvider(subtitleProvider?.provider)) {
    return subtitleProvider.id
  }

  const firstEnabledLLM = providersConfig.find((provider: any) =>
    provider?.enabled !== false && isLLMProvider(provider?.provider),
  )

  return typeof firstEnabledLLM?.id === "string" ? firstEnabledLLM.id : "openai-default"
}

function normalizeCustomPromptsConfig(value: unknown): any {
  if (!isRecord(value)) {
    return { promptId: null, patterns: [] }
  }

  return {
    promptId: typeof value.promptId === "string" ? value.promptId : null,
    patterns: Array.isArray(value.patterns) ? value.patterns : [],
  }
}

export function migrate(oldConfig: any): any {
  const videoSubtitles = isRecord(oldConfig?.videoSubtitles) ? oldConfig.videoSubtitles : {}
  const wordLookup = isRecord(videoSubtitles.wordLookup) ? videoSubtitles.wordLookup : {}

  return {
    ...oldConfig,
    videoSubtitles: {
      ...videoSubtitles,
      interactiveWords: typeof videoSubtitles.interactiveWords === "boolean"
        ? videoSubtitles.interactiveWords
        : true,
      wordLookup: {
        ...wordLookup,
        providerId: typeof wordLookup.providerId === "string" && wordLookup.providerId
          ? wordLookup.providerId
          : findWordLookupProviderId(oldConfig),
        customPromptsConfig: normalizeCustomPromptsConfig(wordLookup.customPromptsConfig),
      },
    },
  }
}
