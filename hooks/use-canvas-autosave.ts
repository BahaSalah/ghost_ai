"use client"

import { useEffect, useRef, useCallback } from "react"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

interface UseCanvasAutosaveOptions {
  projectId: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  setSaveStatus: (status: SaveStatus) => void
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  setSaveStatus,
}: UseCanvasAutosaveOptions) {
  const save = useCallback(async () => {
    setSaveStatus("saving")
    try {
      const res = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      })
      if (!res.ok) {
        setSaveStatus("error")
        return
      }
      setSaveStatus("saved")
    } catch {
      setSaveStatus("error")
    }
  }, [projectId, nodes, edges, setSaveStatus])

  const debouncedSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) return

    if (debouncedSaveRef.current) clearTimeout(debouncedSaveRef.current)
    debouncedSaveRef.current = setTimeout(save, 2000)

    return () => {
      if (debouncedSaveRef.current) clearTimeout(debouncedSaveRef.current)
    }
  }, [nodes, edges, save])
}
