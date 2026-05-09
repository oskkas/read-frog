import type { RefObject } from "react"
import { useLayoutEffect, useState } from "react"

const VIEWPORT_MARGIN = 12
const GAP = 10

export interface WordPopupAnchor {
  x: number
  y: number
}

export function useWordPopupPosition(
  anchor: WordPopupAnchor,
  panelRef: RefObject<HTMLElement | null>,
) {
  const [position, setPosition] = useState({
    top: anchor.y,
    left: anchor.x,
    placement: "above" as "above" | "below",
  })

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) {
      return
    }

    const updatePosition = () => {
      const rect = panel.getBoundingClientRect()
      const hasRoomAbove = anchor.y - rect.height - GAP >= VIEWPORT_MARGIN
      const placement = hasRoomAbove ? "above" : "below"
      const preferredTop = placement === "above"
        ? anchor.y - rect.height - GAP
        : anchor.y + GAP
      const top = Math.min(
        Math.max(preferredTop, VIEWPORT_MARGIN),
        window.innerHeight - rect.height - VIEWPORT_MARGIN,
      )
      const left = Math.min(
        Math.max(anchor.x - rect.width / 2, VIEWPORT_MARGIN),
        window.innerWidth - rect.width - VIEWPORT_MARGIN,
      )

      setPosition({ top, left, placement })
    }

    updatePosition()
    const resizeObserver = new ResizeObserver(updatePosition)
    resizeObserver.observe(panel)
    window.addEventListener("resize", updatePosition)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updatePosition)
    }
  }, [anchor.x, anchor.y, panelRef])

  return position
}
