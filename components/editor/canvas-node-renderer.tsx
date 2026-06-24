"use client"

import React, { useCallback, useState, useRef, useEffect } from "react"
import { Handle, Position, NodeResizer, NodeToolbar, useNodeId, useReactFlow } from "@xyflow/react"
import type { NodeProps } from "@xyflow/react"
import type { CanvasNode } from "@/types/canvas"
import { NODE_COLORS, getNodeColorPair } from "@/types/canvas"

const handleStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  border: "2px solid #18181c",
  background: "#f0f0f4",
}

function NodeHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} className="handle-connect" style={handleStyle} />
      <Handle type="source" position={Position.Top} className="handle-connect" style={handleStyle} />
      <Handle type="target" position={Position.Right} className="handle-connect" style={handleStyle} />
      <Handle type="source" position={Position.Right} className="handle-connect" style={handleStyle} />
      <Handle type="target" position={Position.Bottom} className="handle-connect" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} className="handle-connect" style={handleStyle} />
      <Handle type="target" position={Position.Left} className="handle-connect" style={handleStyle} />
      <Handle type="source" position={Position.Left} className="handle-connect" style={handleStyle} />
    </>
  )
}

function InlineLabel({ label, textColor }: { label: string; textColor: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(label)
  const ref = useRef<HTMLTextAreaElement>(null)
  const nodeId = useNodeId()
  const { updateNodeData } = useReactFlow()

  useEffect(() => {
    setEditValue(label)
  }, [label])

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus()
      ref.current.select()
    }
  }, [isEditing])

  const startEditing = useCallback(() => {
    setIsEditing(true)
  }, [])

  const finishEditing = useCallback(() => {
    setIsEditing(false)
    if (editValue !== label && nodeId) {
      updateNodeData(nodeId, { label: editValue })
    }
  }, [editValue, label, nodeId, updateNodeData])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditValue(label)
        setIsEditing(false)
      }
    },
    [label],
  )

  if (isEditing) {
    return (
      <textarea
        ref={ref}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={finishEditing}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => e.stopPropagation()}
        onDrag={(e) => e.stopPropagation()}
        className="flex h-full w-full resize-none items-center justify-center bg-transparent text-center text-[10px] font-medium outline-none"
        style={{ border: "none", overflow: "hidden", color: textColor }}
      />
    )
  }

  return (
    <div
      className="flex items-center justify-center text-[10px] font-medium"
      style={{ color: textColor }}
      onDoubleClick={startEditing}
    >
      {label || (
        <span className="text-[var(--text-faint)]">Double-click to edit</span>
      )}
    </div>
  )
}

function ColorToolbar({ currentColor }: { currentColor: string }) {
  const nodeId = useNodeId()
  const { updateNodeData } = useReactFlow()
  const [hoveredFill, setHoveredFill] = useState<string | null>(null)

  const handleSelect = useCallback(
    (fill: string) => {
      if (nodeId) {
        updateNodeData(nodeId, { color: fill })
      }
    },
    [nodeId, updateNodeData],
  )

  return (
    <NodeToolbar position={Position.Top} offset={14} align="center">
      <div
        className="flex items-center gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 py-1.5 shadow-lg"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {NODE_COLORS.map((c) => (
          <button
            key={c.fill}
            onClick={() => handleSelect(c.fill)}
            style={{
              background: c.fill,
              boxShadow:
                currentColor === c.fill
                  ? `0 0 0 2px ${c.text}`
                  : hoveredFill === c.fill
                    ? `0 0 6px ${c.text}80`
                    : undefined,
            }}
            className="h-4 w-4 rounded-full transition-shadow duration-150"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseEnter={() => setHoveredFill(c.fill)}
            onMouseLeave={() => setHoveredFill(null)}
          />
        ))}
      </div>
    </NodeToolbar>
  )
}

function RectangleShape({ selected, label, color, textColor }: { selected: boolean; label: string; color: string; textColor: string }) {
  return (
    <>
      <NodeHandles />
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={40}
        color="#505068"
      />
      <div
        className={`flex h-full w-full items-center justify-center rounded-lg border-2 px-3 py-1 ${
          selected ? "border-[var(--accent-primary)]" : "border-[var(--border-default)]"
        }`}
        style={{ background: color }}
      >
        <InlineLabel label={label} textColor={textColor} />
      </div>
    </>
  )
}

function PillShape({ selected, label, color, textColor }: { selected: boolean; label: string; color: string; textColor: string }) {
  return (
    <>
      <NodeHandles />
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={40}
        color="#505068"
      />
      <div
        className={`flex h-full w-full items-center justify-center rounded-full border-2 px-3 py-1 ${
          selected ? "border-[var(--accent-primary)]" : "border-[var(--border-default)]"
        }`}
        style={{ background: color }}
      >
        <InlineLabel label={label} textColor={textColor} />
      </div>
    </>
  )
}

function CircleShape({ selected, label, color, textColor }: { selected: boolean; label: string; color: string; textColor: string }) {
  return (
    <>
      <NodeHandles />
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={60}
        color="#505068"
      />
      <div
        className={`flex h-full w-full items-center justify-center rounded-full border-2 ${
          selected ? "border-[var(--accent-primary)]" : "border-[var(--border-default)]"
        }`}
        style={{ background: color }}
      >
        <InlineLabel label={label} textColor={textColor} />
      </div>
    </>
  )
}

function SvgWrapper({
  selected,
  label,
  color,
  textColor,
  children,
}: {
  selected: boolean
  label: string
  color: string
  textColor: string
  children: React.ReactNode
}) {
  return (
    <>
      <NodeHandles />
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={40}
        color="#505068"
      />
      <div className="relative h-full w-full">
        <div className="absolute inset-0">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center px-2 py-1">
          <InlineLabel label={label} textColor={textColor} />
        </div>
      </div>
    </>
  )
}

function DiamondShape({ selected, color }: { selected: boolean; color: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
      <polygon
        points="50,5 95,50 50,95 5,50"
        fill={color}
        stroke={selected ? "var(--accent-primary)" : "var(--border-default)"}
        strokeWidth="2"
      />
    </svg>
  )
}

function HexagonShape({ selected, color }: { selected: boolean; color: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
      <polygon
        points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
        fill={color}
        stroke={selected ? "var(--accent-primary)" : "var(--border-default)"}
        strokeWidth="2"
      />
    </svg>
  )
}

function CylinderShape({ selected, color }: { selected: boolean; color: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
      <path
        d="M 10 15 L 10 85 A 40 10 0 0 1 90 85 L 90 15 A 40 10 0 0 0 10 15 Z"
        fill={color}
        stroke={selected ? "var(--accent-primary)" : "var(--border-default)"}
        strokeWidth="2"
      />
    </svg>
  )
}

export function CanvasNodeRenderer({ data, selected }: NodeProps<CanvasNode>) {
  const pair = getNodeColorPair(data.color)

  const shape = (() => {
    switch (data.shape) {
      case "pill":
        return <PillShape selected={!!selected} label={data.label} color={pair.fill} textColor={pair.text} />
      case "circle":
        return <CircleShape selected={!!selected} label={data.label} color={pair.fill} textColor={pair.text} />
      case "diamond":
        return (
          <SvgWrapper selected={!!selected} label={data.label} color={pair.fill} textColor={pair.text}>
            <DiamondShape selected={!!selected} color={pair.fill} />
          </SvgWrapper>
        )
      case "hexagon":
        return (
          <SvgWrapper selected={!!selected} label={data.label} color={pair.fill} textColor={pair.text}>
            <HexagonShape selected={!!selected} color={pair.fill} />
          </SvgWrapper>
        )
      case "cylinder":
        return (
          <SvgWrapper selected={!!selected} label={data.label} color={pair.fill} textColor={pair.text}>
            <CylinderShape selected={!!selected} color={pair.fill} />
          </SvgWrapper>
        )
      default:
        return <RectangleShape selected={!!selected} label={data.label} color={pair.fill} textColor={pair.text} />
    }
  })()

  return (
    <>
      {shape}
      <ColorToolbar currentColor={data.color} />
    </>
  )
}
