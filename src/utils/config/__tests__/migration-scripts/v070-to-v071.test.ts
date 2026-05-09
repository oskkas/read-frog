import { describe, expect, it } from "vitest"
import { migrate } from "../../migration-scripts/v070-to-v071"

describe("v070-to-v071 migration", () => {
  it("adds interactive word lookup settings", () => {
    const migrated = migrate({
      providersConfig: [
        { id: "google-translate-default", enabled: true, provider: "google-translate" },
        { id: "openai-default", enabled: true, provider: "openai" },
      ],
      videoSubtitles: {
        providerId: "google-translate-default",
      },
    })

    expect(migrated.videoSubtitles.interactiveWords).toBe(true)
    expect(migrated.videoSubtitles.wordLookup).toEqual({
      providerId: "openai-default",
      customPromptsConfig: { promptId: null, patterns: [] },
    })
  })

  it("uses subtitle provider when it is already an enabled LLM provider", () => {
    const migrated = migrate({
      providersConfig: [
        { id: "openai-default", enabled: true, provider: "openai" },
      ],
      videoSubtitles: {
        providerId: "openai-default",
      },
    })

    expect(migrated.videoSubtitles.wordLookup.providerId).toBe("openai-default")
  })

  it("preserves existing word lookup settings", () => {
    const migrated = migrate({
      videoSubtitles: {
        interactiveWords: false,
        wordLookup: {
          providerId: "custom-ai",
          customPromptsConfig: {
            promptId: "prompt-1",
            patterns: [{ id: "prompt-1", name: "Short", systemPrompt: "S", prompt: "P" }],
          },
        },
      },
    })

    expect(migrated.videoSubtitles.interactiveWords).toBe(false)
    expect(migrated.videoSubtitles.wordLookup.providerId).toBe("custom-ai")
    expect(migrated.videoSubtitles.wordLookup.customPromptsConfig.promptId).toBe("prompt-1")
  })
})
