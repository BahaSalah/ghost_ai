"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
  useErrorListener,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useMyPresence,
} from "@liveblocks/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { ReactFlow, MiniMap, Background, BackgroundVariant } from "@xyflow/react"
import { useWorkspaceBridge } from "./workspace-context"
import { CanvasNodeRenderer } from "./canvas-node-renderer"
import { CanvasEdgeRenderer } from "./canvas-edge-renderer"
import { ShapePanel } from "./shape-panel"
import { CanvasControlBar } from "./canvas-control-bar"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave"
import { StarterTemplatesModal } from "./starter-templates-modal"
import { CollaboratorAvatars } from "./collaborator-avatars"
import { LiveCursors } from "./live-cursors"
import { AiSidebar } from "./ai-sidebar"
import type { CanvasTemplate } from "./starter-templates"
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
  const { isTemplatesOpen, setTemplatesOpen, projectId, setSaveStatus } = useWorkspaceBridge()
  const [error, setError] = useState<string | null>(null)

  useErrorListener(
    useCallback((err: Error) => {
      setError(err.message)
    }, []),
  )

  const reactFlowInstanceRef = useRef<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)

  const nodeTypes = useMemo(() => ({ canvasNode: CanvasNodeRenderer }), [])
  const edgeTypes = useMemo(() => ({ canvasEdge: CanvasEdgeRenderer }), [])

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

  useCanvasAutosave({
    projectId: projectId ?? "",
    nodes,
    edges,
    setSaveStatus,
  })

  const [loadAttempted, setLoadAttempted] = useState(false)

  useEffect(() => {
    if (!projectId || loadAttempted) return

    const roomHasContent = nodes.length > 0 || edges.length > 0
    if (roomHasContent) {
      setLoadAttempted(true)
      return
    }

    const loadCanvas = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/canvas`)
        if (!res.ok) {
          setLoadAttempted(true)
          return
        }
        const data = await res.json()

        const savedNodes: CanvasNode[] = data.nodes ?? []
        const savedEdges: CanvasEdge[] = data.edges ?? []

        if (savedNodes.length === 0 && savedEdges.length === 0) {
          setLoadAttempted(true)
          return
        }

        onNodesChange(
          savedNodes.map((n) => ({ type: "add" as const, item: n })),
        )
        onEdgesChange(
          savedEdges.map((e) => ({ type: "add" as const, item: e })),
        )
      } catch {
        console.error("Failed to load saved canvas")
      } finally {
        setLoadAttempted(true)
      }
    }

    loadCanvas()
  }, [projectId, nodes, edges, onNodesChange, onEdgesChange, loadAttempted])

  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  const handleZoomIn = useCallback(() => {
    reactFlowInstanceRef.current?.zoomIn({ duration: 200 })
  }, [])

  const handleZoomOut = useCallback(() => {
    reactFlowInstanceRef.current?.zoomOut({ duration: 200 })
  }, [])

  const handleFitView = useCallback(() => {
    reactFlowInstanceRef.current?.fitView({ duration: 200 })
  }, [])

  const [, updateMyPresence] = useMyPresence()

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      updateMyPresence({ cursor: { x: event.clientX, y: event.clientY } })
    },
    [updateMyPresence],
  )

  const handleMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null })
  }, [updateMyPresence])

  useKeyboardShortcuts(reactFlowInstanceRef, undo, redo)

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
          color: "#1F1F1F",
          shape,
        },
        width,
        height,
      }
      onNodesChange([{ type: "add", item: newNode }])
    },
    [onNodesChange, generateNodeId],
  )

  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      const removeNodes = nodes.map((n) => ({ type: "remove" as const, id: n.id }))
      const removeEdges = edges.map((e) => ({ type: "remove" as const, id: e.id }))
      const addNodes = template.nodes.map((n) => ({
        type: "add" as const,
        item: { ...n, id: `${template.id}-${n.id}` },
      }))
      const addEdges = template.edges.map((e) => ({
        type: "add" as const,
        item: {
          ...e,
          id: `${template.id}-${e.id}`,
          source: `${template.id}-${e.source}`,
          target: `${template.id}-${e.target}`,
        },
      }))

      onNodesChange([...removeNodes, ...addNodes])
      onEdgesChange([...removeEdges, ...addEdges])

      setTimeout(() => {
        reactFlowInstanceRef.current?.fitView({ duration: 200 })
      }, 50)
    },
    [nodes, edges, onNodesChange, onEdgesChange],
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
    <div className="relative flex flex-1">
      <div
        className="relative flex flex-1"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDelete={onDelete}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onInit={(instance) => {
            reactFlowInstanceRef.current = instance
          }}
          connectionLineStyle={{ stroke: "#505060", strokeWidth: 2 }}
          defaultEdgeOptions={{
            type: "canvasEdge",
            style: { stroke: "#f0f0f4", strokeWidth: 1.5, opacity: 0.35 },
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
        </ReactFlow>
        <ShapePanel />
        <CanvasControlBar
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>
      <AiSidebar />

      <div className="absolute right-4 top-3 z-50 flex items-center gap-2">
        <CollaboratorAvatars />
      </div>

      <LiveCursors />

      <StarterTemplatesModal
        open={isTemplatesOpen}
        onOpenChange={setTemplatesOpen}
        onImport={handleImportTemplate}
      />
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
