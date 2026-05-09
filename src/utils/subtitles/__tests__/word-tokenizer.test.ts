import { afterEach, describe, expect, it, vi } from "vitest"
import { tokenizeSubtitleText } from "../word-tokenizer"

describe("tokenizeSubtitleText", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("tokenizes English words, spaces, and punctuation", () => {
    expect(tokenizeSubtitleText("Hello, world!").map(({ text, isWord }) => ({ text, isWord }))).toEqual([
      { text: "Hello", isWord: true },
      { text: ",", isWord: false },
      { text: " ", isWord: false },
      { text: "world", isWord: true },
      { text: "!", isWord: false },
    ])
  })

  it("marks numbers as word-like tokens", () => {
    const words = tokenizeSubtitleText("I have 3 dogs")
      .filter(token => token.isWord)
      .map(token => token.text)

    expect(words).toEqual(["I", "have", "3", "dogs"])
  })

  it("handles empty and whitespace-only text", () => {
    expect(tokenizeSubtitleText("")).toEqual([])
    expect(tokenizeSubtitleText("   ")).toEqual([{ text: "   ", index: 0, isWord: false }])
  })

  it("uses Intl.Segmenter for CJK word boundaries when available", () => {
    const tokens = tokenizeSubtitleText("今日は天気がいい", "ja")

    expect(tokens.map(token => token.text).join("")).toBe("今日は天気がいい")
    expect(tokens.some(token => token.isWord)).toBe(true)
  })

  it("falls back to regex tokenization when Intl.Segmenter is unavailable", () => {
    vi.stubGlobal("Intl", { ...Intl, Segmenter: undefined })

    expect(tokenizeSubtitleText("Hello, world!").map(({ text, isWord }) => ({ text, isWord }))).toEqual([
      { text: "Hello", isWord: true },
      { text: ",", isWord: false },
      { text: " ", isWord: false },
      { text: "world", isWord: true },
      { text: "!", isWord: false },
    ])
  })
})
