"use client"

import { useEffect } from "react"
import type { ReactFlowInstance } from "@xyflow/react"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"

export function useKeyboardShortcuts(
  reactFlowInstanceRef: React.MutableRefObject<ReactFlowInstance<CanvasNode, CanvasEdge> | null>,
  undo: () => void,
  redo: () => void,
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      const isCmd = event.metaKey || event.ctrlKey

      if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        reactFlowInstanceRef.current?.zoomIn({ duration: 200 })
        return
      }

      if (event.key === "-") {
        event.preventDefault()
        reactFlowInstanceRef.current?.zoomOut({ duration: 200 })
        return
      }

      if (isCmd && event.key === "z" && !event.shiftKey) {
        event.preventDefault()
        undo()
        return
      }

      if ((isCmd && event.key === "z" && event.shiftKey) || (isCmd && event.key === "y")) {
        event.preventDefault()
        redo()
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, reactFlowInstanceRef])
}
