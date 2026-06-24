"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  Position,
} from "@xyflow/react"
import type { EdgeProps } from "@xyflow/react"
import type { CanvasEdge } from "@/types/canvas"

function ArrowHead({
  x,
  y,
  position,
  color,
  opacity,
}: {
  x: number
  y: number
  position: Position
  color: string
  opacity: number
}) {
  const size = 8
  const half = size * 0.4
  let points: string
  switch (position) {
    case Position.Left:
      points = `${x},${y} ${x - size},${y - half} ${x - size},${y + half}`
      break
    case Position.Right:
      points = `${x},${y} ${x + size},${y - half} ${x + size},${y + half}`
      break
    case Position.Top:
      points = `${x},${y} ${x - half},${y - size} ${x + half},${y - size}`
      break
    case Position.Bottom:
      points = `${x},${y} ${x - half},${y + size} ${x + half},${y + size}`
      break
  }
  return <polygon points={points} fill={color} opacity={opacity} />
}

export function CanvasEdgeRenderer({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps<CanvasEdge>) {
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(data?.label ?? "")
  const inputRef = useRef<HTMLInputElement>(null)
  const { updateEdgeData } = useReactFlow()

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const label = data?.label ?? ""
  const isActive = isHovered || selected
  const strokeColor = "#f0f0f4"
  const strokeOpacity = isActive ? 1 : 0.35
  const strokeWidth = isActive ? 2 : 1.5

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const startEditing = useCallback(() => {
    setEditValue(label)
    setIsEditing(true)
  }, [label])

  const finishEditing = useCallback(() => {
    setIsEditing(false)
    if (editValue !== label) {
      updateEdgeData(id, { label: editValue })
    }
  }, [editValue, label, id, updateEdgeData])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditValue(label)
        setIsEditing(false)
      } else if (e.key === "Enter") {
        finishEditing()
      }
    },
    [finishEditing, label],
  )

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={startEditing}
        style={{ pointerEvents: "stroke", cursor: "pointer" }}
      />
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={strokeOpacity}
        style={{ transition: "opacity 0.2s, stroke-width 0.2s" }}
      />
      <ArrowHead
        x={targetX}
        y={targetY}
        position={targetPosition}
        color={strokeColor}
        opacity={strokeOpacity}
      />
      {(label || isActive) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={finishEditing}
                onKeyDown={handleKeyDown}
                onPointerDown={(e) => e.stopPropagation()}
                onDrag={(e) => e.stopPropagation()}
                style={{
                  background: "#18181c",
                  border: "1px solid #3a3a42",
                  borderRadius: 4,
                  color: "#f0f0f4",
                  fontSize: 11,
                  padding: "2px 6px",
                  outline: "none",
                  minWidth: 40,
                  width: `${Math.max(40, editValue.length * 8 + 16)}px`,
                  textAlign: "center",
                  fontFamily: "var(--font-geist-sans)",
                }}
              />
            ) : label ? (
              <span
                onDoubleClick={startEditing}
                style={{
                  background: "#18181c",
                  border: "1px solid #3a3a42",
                  borderRadius: 9999,
                  color: "#c0c0cc",
                  fontSize: 10,
                  padding: "1px 8px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {label}
              </span>
            ) : (
              <span
                onDoubleClick={startEditing}
                style={{
                  color: "#505060",
                  fontSize: 10,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Add label
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
