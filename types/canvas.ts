import type { Node, Edge } from "@xyflow/react"

export interface CanvasNodeData {
  label: string
  color: string
  shape: string
}

export type CanvasNode = Node<CanvasNodeData & Record<string, unknown>, "canvasNode">
export type CanvasEdge = Edge<Record<string, never>, "canvasEdge">
