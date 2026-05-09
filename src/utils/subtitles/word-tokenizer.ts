export interface WordToken {
  text: string
  index: number
  isWord: boolean
}

interface SegmenterConstructor {
  new(locale?: string, options?: { granularity: "word" }): {
    segment: (input: string) => Iterable<{ segment: string, isWordLike?: boolean }>
  }
}

const FALLBACK_TOKEN_RE = /(\s+|[^\s\w]+)/u
const FALLBACK_WORD_RE = /[\p{L}\p{N}_]/u

function getSegmenter(): SegmenterConstructor | undefined {
  return (Intl as typeof Intl & { Segmenter?: SegmenterConstructor }).Segmenter
}

function fallbackTokenize(text: string): WordToken[] {
  return text
    .split(FALLBACK_TOKEN_RE)
    .filter(segment => segment.length > 0)
    .map((segment, index) => ({
      text: segment,
      index,
      isWord: FALLBACK_WORD_RE.test(segment),
    }))
}

export function tokenizeSubtitleText(text: string, locale?: string): WordToken[] {
  if (!text) {
    return []
  }

  const Segmenter = getSegmenter()
  if (!Segmenter) {
    return fallbackTokenize(text)
  }

  try {
    const segmenter = new Segmenter(locale, { granularity: "word" })
    return Array.from(segmenter.segment(text), (segment, index) => ({
      text: segment.segment,
      index,
      isWord: !!segment.isWordLike,
    }))
  }
  catch {
    return fallbackTokenize(text)
  }
}
