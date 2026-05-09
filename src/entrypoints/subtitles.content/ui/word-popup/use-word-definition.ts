import type { WordPopupState } from "../../atoms"
import { useAtomValue } from "jotai"
import { useCallback, useEffect, useState } from "react"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { streamWordLookup } from "@/utils/subtitles/word-lookup"

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError"
}

export function useWordDefinition(state: WordPopupState | null, refreshKey = 0) {
  const language = useAtomValue(configFieldsAtomMap.language)
  const { wordLookup } = useAtomValue(configFieldsAtomMap.videoSubtitles)
  const [definition, setDefinition] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [runId, setRunId] = useState(0)

  const regenerate = useCallback(() => {
    setRunId(id => id + 1)
  }, [])

  useEffect(() => {
    if (!state) {
      setDefinition("")
      setIsLoading(false)
      setError(null)
      return
    }

    const abortController = new AbortController()
    setDefinition("")
    setError(null)
    setIsLoading(true)

    void streamWordLookup({
      word: state.word,
      sentence: state.sentence,
      sentenceTranslation: state.sentenceTranslation,
      sourceLanguage: language.sourceCode,
      targetLanguage: language.targetCode,
      langLevel: language.level,
      providerId: wordLookup.providerId,
      signal: abortController.signal,
      onChunk: snapshot => setDefinition(snapshot.output),
    })
      .then(snapshot => setDefinition(snapshot.output))
      .catch((caughtError: unknown) => {
        if (isAbortError(caughtError) || abortController.signal.aborted) {
          return
        }
        setError(caughtError instanceof Error ? caughtError : new Error(String(caughtError)))
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => {
      abortController.abort()
    }
  }, [language.level, language.sourceCode, language.targetCode, refreshKey, runId, state, wordLookup.providerId])

  return {
    definition,
    isLoading,
    error,
    regenerate,
  }
}
