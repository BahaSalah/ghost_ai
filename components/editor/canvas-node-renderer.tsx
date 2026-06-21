"use client"

import React from "react"
import type { NodeProps } from "@xyflow/react"
import type { CanvasNode } from "@/types/canvas"

export function CanvasNodeRenderer({ data, selected }: NodeProps<CanvasNode>) {
  return (
    <div
      data-shape={data.shape}
      className={`flex h-full w-full items-center justify-center rounded-lg border-2 px-4 py-2 text-sm ${
        selected
          ? "border-[var(--accent-primary)] bg-[var(--bg-elevated)]"
          : "border-[var(--border-default)] bg-[var(--bg-surface)]"
      }`}
    >
      {data.label || ""}
    </div>
  )
}
