import type { VersionTestData } from "./types"
import { testSeries as v070TestSeries } from "./v070"

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

export const testSeries = Object.fromEntries(
  Object.entries(v070TestSeries).map(([seriesId, seriesData]) => [
    seriesId,
    {
      ...seriesData,
      config: {
        ...seriesData.config,
        videoSubtitles: {
          ...seriesData.config.videoSubtitles,
          interactiveWords: true,
          wordLookup: {
            providerId: findWordLookupProviderId(seriesData.config),
            customPromptsConfig: {
              promptId: null,
              patterns: [],
            },
          },
        },
      },
    },
  ]),
) as VersionTestData["testSeries"]
