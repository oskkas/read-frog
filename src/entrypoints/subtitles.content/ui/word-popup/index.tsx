import { useAtomValue, useSetAtom } from "jotai"
import { useEffect, useRef } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { wordPopupAtom } from "../../atoms"
import { WordPopupPanel } from "./word-popup-panel"

function SubtitleWordPopupInner() {
  const wordPopup = useAtomValue(wordPopupAtom)
  const setWordPopup = useSetAtom(wordPopupAtom)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wordPopup) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setWordPopup(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setWordPopup, wordPopup])

  useEffect(() => {
    if (!wordPopup) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const popup = popupRef.current
      if (!popup) {
        return
      }

      if (event.composedPath().includes(popup)) {
        return
      }

      setWordPopup(null)
    }

    document.addEventListener("pointerdown", handlePointerDown, true)
    return () => document.removeEventListener("pointerdown", handlePointerDown, true)
  }, [setWordPopup, wordPopup])

  if (!wordPopup) {
    return null
  }

  return (
    <div
      ref={popupRef}
      className="pointer-events-none fixed inset-0 z-30"
    >
      <WordPopupPanel
        state={wordPopup}
        onClose={() => setWordPopup(null)}
      />
    </div>
  )
}

export function SubtitleWordPopup() {
  const wordPopup = useAtomValue(wordPopupAtom)

  return (
    <ErrorBoundary
      fallbackRender={() => null}
      resetKeys={[wordPopup?.word, wordPopup?.anchor.x, wordPopup?.anchor.y]}
    >
      <SubtitleWordPopupInner />
    </ErrorBoundary>
  )
}
