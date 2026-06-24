"use client"

import { useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CANVAS_TEMPLATES } from "./starter-templates"
import type { CanvasTemplate } from "./starter-templates"

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const VW = 280
  const VH = 160

  const { scale, px, py, nodeCenters } = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const n of template.nodes) {
      const w = n.width ?? 160
      const h = n.height ?? 100
      minX = Math.min(minX, n.position.x)
      minY = Math.min(minY, n.position.y)
      maxX = Math.max(maxX, n.position.x + w)
      maxY = Math.max(maxY, n.position.y + h)
    }

    const PAD = 20
    const bw = maxX - minX + PAD * 2
    const bh = maxY - minY + PAD * 2
    const s = Math.min(VW / bw, VH / bh, 1)
    const ox = (VW - bw * s) / 2
    const oy = (VH - bh * s) / 2

    const xf = (x: number) => (x - minX + PAD) * s + ox
    const yf = (y: number) => (y - minY + PAD) * s + oy

    const centers: Record<string, { cx: number; cy: number }> = {}
    for (const n of template.nodes) {
      const w = n.width ?? 160
      const h = n.height ?? 100
      centers[n.id] = {
        cx: xf(n.position.x + w / 2),
        cy: yf(n.position.y + h / 2),
      }
    }

    return { scale: s, px: xf, py: yf, nodeCenters: centers }
  }, [template.nodes])

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {template.edges.map((edge) => {
        const s = nodeCenters[edge.source]
        const t = nodeCenters[edge.target]
        if (!s || !t) return null
        return (
          <line key={edge.id} x1={s.cx} y1={s.cy} x2={t.cx} y2={t.cy} stroke="#505060" strokeWidth={1.5} />
        )
      })}
      {template.nodes.map((node) => {
        const w = (node.width ?? 160) * scale
        const h = (node.height ?? 100) * scale
        const x = px(node.position.x)
        const y = py(node.position.y)
        const shape = node.data.shape ?? "rectangle"
        const color = node.data.color ?? "#1F1F1F"

        const stroke = "#3a3a42"

        return (
          <g key={node.id}>
            {shape === "rectangle" && (
              <rect x={x} y={y} width={w} height={h} rx={6} fill={color} stroke={stroke} strokeWidth={1} />
            )}
            {shape === "pill" && (
              <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={color} stroke={stroke} strokeWidth={1} />
            )}
            {shape === "circle" && (
              <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) / 2} fill={color} stroke={stroke} strokeWidth={1} />
            )}
            {shape === "diamond" && (
              <polygon
                points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`}
                fill={color}
                stroke={stroke}
                strokeWidth={1}
              />
            )}
            {shape === "hexagon" && (
              <polygon
                points={`${x + w / 2},${y} ${x + w * 0.93},${y + h * 0.275} ${x + w * 0.93},${y + h * 0.725} ${x + w / 2},${y + h} ${x + w * 0.07},${y + h * 0.725} ${x + w * 0.07},${y + h * 0.275}`}
                fill={color}
                stroke={stroke}
                strokeWidth={1}
              />
            )}
            {shape === "cylinder" && (
              <path
                d={`M ${x + w * 0.1},${y + h * 0.15} L ${x + w * 0.1},${y + h * 0.85} A ${w * 0.4},${h * 0.1} 0 0 0 ${x + w * 0.9},${y + h * 0.85} L ${x + w * 0.9},${y + h * 0.15} A ${w * 0.4},${h * 0.1} 0 0 1 ${x + w * 0.1},${y + h * 0.15} Z`}
                fill={color}
                stroke={stroke}
                strokeWidth={1}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

interface StarterTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Starter Templates</DialogTitle>
          <DialogDescription>
            Start from a pre-built diagram instead of building from scratch.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-6 grid max-h-[480px] gap-4 overflow-y-auto px-6 sm:grid-cols-2 lg:grid-cols-3">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex flex-col overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]"
            >
              <div className="flex aspect-[7/4] items-center justify-center border-b border-[var(--border-default)] bg-[var(--bg-subtle)] p-2">
                <TemplatePreview template={template} />
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-3">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                  {template.name}
                </h3>
                <p className="flex-1 text-xs text-[var(--text-secondary)]">
                  {template.description}
                </p>
                <Button
                  size="sm"
                  className="mt-2 self-start"
                  onClick={() => {
                    onImport(template)
                    onOpenChange(false)
                  }}
                >
                  Import
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
