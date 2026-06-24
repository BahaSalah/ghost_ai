import type { Node, Edge } from "@xyflow/react"

export interface CanvasNodeData {
  label: string
  color: string
  shape: string
}

export type CanvasNode = Node<CanvasNodeData & Record<string, unknown>, "canvasNode">
export interface CanvasEdgeData {
  label?: string
  [key: string]: unknown
}

export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">

export interface NodeColor {
  fill: string
  text: string
}

export const NODE_COLORS: NodeColor[] = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
]

export function getNodeColorPair(fill: string): NodeColor {
  return NODE_COLORS.find((c) => c.fill === fill) ?? NODE_COLORS[0]
}
