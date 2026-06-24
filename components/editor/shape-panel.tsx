"use client"

import React, { useCallback, useState } from "react"
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

function ShapePreview({ shape }: { shape: ShapeConfig }) {
  const previewWidth = 60
  const scale = previewWidth / shape.width
  const previewHeight = shape.height * scale

  const renderShape = () => {
    switch (shape.shape) {
      case "rectangle":
        return <div className="h-full w-full rounded border-2 border-[var(--border-default)] bg-[var(--bg-surface)]" />
      case "pill":
        return <div className="h-full w-full rounded-full border-2 border-[var(--border-default)] bg-[var(--bg-surface)]" />
      case "circle":
        return <div className="h-full w-full rounded-full border-2 border-[var(--border-default)] bg-[var(--bg-surface)]" />
      case "diamond":
        return (
          <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
            <polygon
              points="50,5 95,50 50,95 5,50"
              fill="var(--bg-surface)"
              stroke="var(--border-default)"
              strokeWidth="2"
            />
          </svg>
        )
      case "hexagon":
        return (
          <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
            <polygon
              points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
              fill="var(--bg-surface)"
              stroke="var(--border-default)"
              strokeWidth="2"
            />
          </svg>
        )
      case "cylinder":
        return (
          <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
            <path
              d="M 10 15 L 10 85 A 40 10 0 0 1 90 85 L 90 15 A 40 10 0 0 0 10 15 Z"
              fill="var(--bg-surface)"
              stroke="var(--border-default)"
              strokeWidth="2"
            />
          </svg>
        )
      default:
        return null
    }
  }

  if (!previewHeight || !previewWidth) return null

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: previewWidth, height: previewHeight }}
    >
      {renderShape()}
    </div>
  )
}

function ShapeButton({ config, onDragStart, onDrag, onDragEnd }: {
  config: ShapeConfig
  onDragStart: (config: ShapeConfig, x: number, y: number) => void
  onDrag: (x: number, y: number) => void
  onDragEnd: () => void
}) {
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

      const canvas = document.createElement("canvas")
      canvas.width = 1
      canvas.height = 1
      event.dataTransfer.setDragImage(canvas, 0, 0)

      onDragStart(config, event.clientX, event.clientY)
    },
    [config, onDragStart],
  )

  const handleDrag = useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      if (event.clientX === 0 && event.clientY === 0) return
      onDrag(event.clientX, event.clientY)
    },
    [onDrag],
  )

  return (
    <button
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={onDragEnd}
      className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      title={config.label}
    >
      {config.icon}
    </button>
  )
}

export function ShapePanel() {
  const [draggedConfig, setDraggedConfig] = useState<ShapeConfig | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleDragStart = useCallback((config: ShapeConfig, x: number, y: number) => {
    setDraggedConfig(config)
    setMousePos({ x, y })
  }, [])

  const handleDrag = useCallback((x: number, y: number) => {
    setMousePos({ x, y })
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedConfig(null)
  }, [])

  return (
    <>
      <div className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 shadow-lg">
          {SHAPES.map((s) => (
            <ShapeButton
              key={s.shape}
              config={s}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </div>
      {draggedConfig && (
        <div
          className="pointer-events-none fixed z-[100] flex items-center justify-center opacity-70"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <ShapePreview shape={draggedConfig} />
        </div>
      )}
    </>
  )
}
