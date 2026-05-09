import type { SubtitleTextStyle } from "@/types/config/subtitles"
import { useAtomValue, useSetAtom } from "jotai"
import { useCallback, useMemo } from "react"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { SUBTITLE_FONT_FAMILIES } from "@/utils/constants/subtitles"
import { getLanguageDirectionAndLang } from "@/utils/content/language-direction"
import { cn } from "@/utils/styles/utils"
import { tokenizeSubtitleText } from "@/utils/subtitles/word-tokenizer"
import { currentSubtitleAtom, subtitlesStore, videoElementRefAtom, wordPopupAtom } from "../atoms"

interface SubtitleLineProps {
  content?: string
  className?: string
}

function getTextStyles(textStyle: SubtitleTextStyle) {
  return {
    fontFamily: SUBTITLE_FONT_FAMILIES[textStyle.fontFamily] || SUBTITLE_FONT_FAMILIES.system,
    fontSize: `${textStyle.fontScale / 100}em`,
    color: textStyle.color,
    fontWeight: textStyle.fontWeight,
  }
}

export function MainSubtitle({ content, className }: SubtitleLineProps) {
  const subtitle = useAtomValue(currentSubtitleAtom)
  const { interactiveWords, style } = useAtomValue(configFieldsAtomMap.videoSubtitles)
  const text = content ?? subtitle?.text ?? ""

  return (
    <div
      className={cn("subtitles-main leading-tight text-xl", className)}
      style={getTextStyles(style.main)}
    >
      {interactiveWords ? <InteractiveSubtitleText text={text} /> : text}
    </div>
  )
}

function InteractiveSubtitleText({ text }: { text: string }) {
  const language = useAtomValue(configFieldsAtomMap.language)
  const subtitle = useAtomValue(currentSubtitleAtom)
  const setWordPopup = useSetAtom(wordPopupAtom)
  const locale = language.sourceCode === "auto"
    ? undefined
    : getLanguageDirectionAndLang(language.sourceCode).lang
  const tokens = useMemo(
    () => tokenizeSubtitleText(text, locale),
    [locale, text],
  )

  const handleWordClick = useCallback((word: string, rect: DOMRect) => {
    const video = subtitlesStore.get(videoElementRefAtom)
    if (video && !video.paused) {
      video.pause()
    }

    setWordPopup({
      word,
      sentence: subtitle?.text ?? text,
      sentenceTranslation: subtitle?.translation,
      anchor: {
        x: rect.left + rect.width / 2,
        y: rect.top,
      },
    })
  }, [setWordPopup, subtitle, text])

  return (
    <>
      {tokens.map(token => token.isWord
        ? (
            <span
              key={token.index}
              className="pointer-events-auto cursor-pointer rounded-[3px] px-[0.04em] transition-colors hover:bg-white/20 active:bg-white/30"
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation()
                handleWordClick(token.text, event.currentTarget.getBoundingClientRect())
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") {
                  return
                }
                event.preventDefault()
                event.stopPropagation()
                handleWordClick(token.text, event.currentTarget.getBoundingClientRect())
              }}
            >
              {token.text}
            </span>
          )
        : <span key={token.index}>{token.text}</span>)}
    </>
  )
}

export function TranslationSubtitle({ content, className }: SubtitleLineProps) {
  const subtitle = useAtomValue(currentSubtitleAtom)
  const { style } = useAtomValue(configFieldsAtomMap.videoSubtitles)
  const language = useAtomValue(configFieldsAtomMap.language)
  const text = content ?? subtitle?.translation ?? ""
  const { dir, lang } = getLanguageDirectionAndLang(language.targetCode)

  return (
    <div
      className={cn("subtitles-translation leading-tight text-xl", className)}
      style={getTextStyles(style.translation)}
      dir={dir}
      lang={lang}
    >
      {text}
    </div>
  )
}
