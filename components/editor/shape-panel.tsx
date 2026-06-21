"use client"

import React, { useCallback } from "react"
import {
  Square,
  Diamond,
  Circle,
  Pill,
  Cylinder,
  Hexagon,
} from "lucide-react"

interface ShapeConfig {
  shape: string
  label: string
  width: number
  height: number
  icon: React.ReactElement
}

const SHAPES: ShapeConfig[] = [
  { shape: "rectangle", label: "Rectangle", width: 160, height: 100, icon: <Square size={18} /> },
  { shape: "diamond", label: "Diamond", width: 130, height: 130, icon: <Diamond size={18} /> },
  { shape: "circle", label: "Circle", width: 100, height: 100, icon: <Circle size={18} /> },
  { shape: "pill", label: "Pill", width: 150, height: 80, icon: <Pill size={18} /> },
  { shape: "cylinder", label: "Cylinder", width: 120, height: 100, icon: <Cylinder size={18} /> },
  { shape: "hexagon", label: "Hexagon", width: 120, height: 100, icon: <Hexagon size={18} /> },
]

function ShapeButton({ config }: { config: ShapeConfig }) {
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      event.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          shape: config.shape,
          width: config.width,
          height: config.height,
        }),
      )
      event.dataTransfer.effectAllowed = "move"
    },
    [config],
  )

  return (
    <button
      draggable
      onDragStart={handleDragStart}
      className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      title={config.label}
    >
      {config.icon}
    </button>
  )
}

export function ShapePanel() {
  return (
    <div className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 shadow-lg">
        {SHAPES.map((s) => (
          <ShapeButton key={s.shape} config={s} />
        ))}
      </div>
    </div>
  )
}
