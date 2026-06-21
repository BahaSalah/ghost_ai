"use client"

import React, { useState, useCallback, useMemo, useRef } from "react"
import { useParams } from "next/navigation"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
  useErrorListener,
} from "@liveblocks/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import { ReactFlow, MiniMap, Background, BackgroundVariant } from "@xyflow/react"
import { useWorkspaceBridge } from "./workspace-context"
import { CanvasNodeRenderer } from "./canvas-node-renderer"
import { ShapePanel } from "./shape-panel"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"
import type { ReactFlowInstance } from "@xyflow/react"

class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

function CanvasInner() {
  const { isAiOpen } = useWorkspaceBridge()
  const [error, setError] = useState<string | null>(null)

  useErrorListener(
    useCallback((err: Error) => {
      setError(err.message)
    }, []),
  )

  const reactFlowInstanceRef = useRef<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)

  const nodeTypes = useMemo(() => ({ canvasNode: CanvasNodeRenderer }), [])

  const nodeCounterRef = useRef(0)
  const generateNodeId = useCallback((shape: string): string => {
    const ts = new Date().toISOString().replace(/[:.]/g, "-")
    const counter = nodeCounterRef.current++
    return `${shape}-${ts}-${counter}`
  }, [])

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const instance = reactFlowInstanceRef.current
      if (!instance) return
      const jsonData = event.dataTransfer.getData("application/json")
      if (!jsonData) return
      let shapeData: { shape: string; width: number; height: number }
      try {
        shapeData = JSON.parse(jsonData)
      } catch {
        return
      }
      if (!shapeData.shape) return
      const { shape, width, height } = shapeData
      const position = instance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const newNode: CanvasNode = {
        id: generateNodeId(shape),
        type: "canvasNode",
        position,
        data: {
          label: "",
          color: "#505068",
          shape,
        },
        width,
        height,
      }
      onNodesChange([{ type: "add", item: newNode }])
    },
    [onNodesChange, generateNodeId],
  )

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-[var(--bg-base)]">
        <p className="text-sm text-[var(--state-error)]">Connection error</p>
        <p className="text-xs text-[var(--text-faint)]">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1">
      <div
        className="relative flex flex-1"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDelete={onDelete}
          onInit={(instance) => {
            reactFlowInstanceRef.current = instance
          }}
          connectionLineStyle={{ stroke: "#505060", strokeWidth: 2 }}
          defaultEdgeOptions={{
            style: { stroke: "#505060", strokeWidth: 2 },
          }}
          fitView
          colorMode="dark"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#2a2a30"
          />
          <MiniMap
            style={{ background: "#111114" }}
            nodeStrokeColor="#2a2a30"
            nodeColor="#18181c"
            maskColor="rgba(0,0,0,0.7)"
          />
          <Cursors />
        </ReactFlow>
        <ShapePanel />
      </div>
      {isAiOpen && (
        <aside className="flex w-80 flex-col border-l border-[var(--border-default)] bg-[var(--bg-elevated)]">
          <div className="flex items-center border-b border-[var(--border-default)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              AI Assistant
            </h2>
          </div>
          <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-center text-sm text-[var(--text-faint)]">
              AI chat will appear here
            </p>
          </div>
        </aside>
      )}
    </div>
  )
}

function WorkspaceCanvas() {
  const params = useParams()
  const roomId = params.roomId as string

  return (
    <CanvasErrorBoundary
      fallback={
        <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-[var(--bg-base)]">
          <p className="text-sm text-[var(--state-error)]">
            Failed to connect
          </p>
          <p className="text-xs text-[var(--text-faint)]">
            Could not load the collaborative canvas. Please try refreshing.
          </p>
        </div>
      }
    >
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, isThinking: false }}
        >
          <ClientSideSuspense
            fallback={
              <div className="flex flex-1 items-center justify-center bg-[var(--bg-base)]">
                <p className="text-sm text-[var(--text-faint)]">
                  Loading canvas...
                </p>
              </div>
            }
          >
            <CanvasInner />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  )
}

export function WorkspaceContent() {
  return <WorkspaceCanvas />
}
