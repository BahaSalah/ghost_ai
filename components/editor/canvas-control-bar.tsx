"use client"

import React from "react"
import { ZoomOut, ZoomIn, Maximize2, Undo2, Redo2 } from "lucide-react"

interface ControlButtonProps {
  onClick: () => void
  title: string
  icon: React.ComponentType<{ size?: number }>
  disabled?: boolean
}

function ControlButton({ onClick, title, icon: Icon, disabled }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--text-secondary)]"
    >
      <Icon size={15} />
    </button>
  )
}

export interface CanvasControlBarProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function CanvasControlBar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlBarProps) {
  return (
    <div className="absolute bottom-24 left-4 z-50">
      <div className="flex items-center gap-0.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 py-1.5 shadow-lg">
        <ControlButton onClick={onZoomOut} title="Zoom out" icon={ZoomOut} />
        <ControlButton onClick={onFitView} title="Fit view" icon={Maximize2} />
        <ControlButton onClick={onZoomIn} title="Zoom in" icon={ZoomIn} />
        <div className="mx-1 h-4 w-px bg-[var(--border-default)]" />
        <ControlButton onClick={onUndo} title="Undo" icon={Undo2} disabled={!canUndo} />
        <ControlButton onClick={onRedo} title="Redo" icon={Redo2} disabled={!canRedo} />
      </div>
    </div>
  )
}
