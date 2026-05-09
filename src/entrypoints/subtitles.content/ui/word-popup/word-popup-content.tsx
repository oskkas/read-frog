import type { WordPopupState } from "../../atoms"
import LoadingDots from "@/components/loading-dots"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Button } from "@/components/ui/base-ui/button"
import { useWordDefinition } from "./use-word-definition"

export function WordPopupContent({ refreshKey, state }: { refreshKey: number, state: WordPopupState }) {
  const { definition, error, isLoading, regenerate } = useWordDefinition(state, refreshKey)

  if (error) {
    return (
      <div className="space-y-3 text-[13px]">
        <p className="text-destructive leading-snug">{error.message}</p>
        <Button type="button" size="sm" variant="outline" onClick={regenerate}>
          Retry
        </Button>
      </div>
    )
  }

  if (!definition && isLoading) {
    return (
      <div className="flex h-20 items-center justify-center">
        <LoadingDots className="[&_div]:bg-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <MarkdownRenderer
        content={definition}
        className="text-left [&_blockquote]:mb-2 [&_blockquote]:mt-2 [&_h1]:hidden [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-[13px] [&_h3]:mb-1.5 [&_h3]:mt-2.5 [&_li]:text-[13px] [&_p]:mb-2 [&_p]:mt-2 [&_p]:text-[13px] [&_ul]:mb-2 [&_ul]:mt-2"
      />
      {isLoading && <LoadingDots className="justify-start py-1 [&_div]:bg-muted-foreground" />}
    </div>
  )
}
