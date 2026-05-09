// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DEFAULT_CONFIG } from "@/utils/constants/config"
import { subtitlesStore, wordPopupAtom } from "../../atoms"
import { SubtitlesProviders } from "../subtitles-ui-context"
import { SubtitleWordPopup } from "../word-popup"

const mockedAtoms = vi.hoisted(() => ({
  languageAtom: null as any,
  languageDetectionAtom: null as any,
  providersConfigAtom: null as any,
  ttsAtom: null as any,
  videoSubtitlesAtom: null as any,
}))

vi.mock("@/utils/atoms/config", async () => {
  const { atom } = await import("jotai")
  const languageAtom = atom(DEFAULT_CONFIG.language)
  const languageDetectionAtom = atom(DEFAULT_CONFIG.languageDetection)
  const providersConfigAtom = atom(DEFAULT_CONFIG.providersConfig)
  const ttsAtom = atom(DEFAULT_CONFIG.tts)
  const videoSubtitlesAtom = atom(DEFAULT_CONFIG.videoSubtitles)

  mockedAtoms.languageAtom = languageAtom
  mockedAtoms.languageDetectionAtom = languageDetectionAtom
  mockedAtoms.providersConfigAtom = providersConfigAtom
  mockedAtoms.ttsAtom = ttsAtom
  mockedAtoms.videoSubtitlesAtom = videoSubtitlesAtom

  return {
    configFieldsAtomMap: {
      language: languageAtom,
      languageDetection: languageDetectionAtom,
      providersConfig: providersConfigAtom,
      tts: ttsAtom,
      videoSubtitles: videoSubtitlesAtom,
    },
  }
})

vi.mock("@/utils/subtitles/word-lookup", () => ({
  streamWordLookup: vi.fn(async ({ onChunk }) => {
    const snapshot = {
      output: "A short definition.",
      thinking: { status: "complete", text: "" },
    }
    onChunk?.(snapshot)
    return snapshot
  }),
}))

class ResizeObserverMock {
  observe = vi.fn()
  disconnect = vi.fn()
}

const adapter = {
  embedded: false,
  downloadSourceSubtitles: vi.fn(),
  getControlsConfig: vi.fn(() => undefined),
  toggleSubtitlesManually: vi.fn(),
}

describe("subtitleWordPopup", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock)
    subtitlesStore.set(wordPopupAtom, {
      word: "ephemeral",
      sentence: "The moment was ephemeral.",
      anchor: { x: 200, y: 200 },
    })
  })

  afterEach(() => {
    subtitlesStore.set(wordPopupAtom, null)
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it("renders inside subtitle providers without crashing the subtitle UI root", () => {
    render(
      <SubtitlesProviders adapter={adapter}>
        <SubtitleWordPopup />
      </SubtitlesProviders>,
    )

    expect(screen.getByText("ephemeral")).toBeInTheDocument()
  })
})
