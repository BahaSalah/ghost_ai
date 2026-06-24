"use client"

import { createContext, useContext } from "react"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"

interface WorkspaceBridgeValue {
  projectId: string | null
  projectName: string | null
  projectRole: "owner" | "collaborator" | null
  isAiOpen: boolean
  isShareOpen: boolean
  isTemplatesOpen: boolean
  saveStatus: SaveStatus
  setProjectId: (id: string | null) => void
  setProjectName: (name: string | null) => void
  setProjectRole: (role: "owner" | "collaborator" | null) => void
  setAiOpen: (open: boolean) => void
  setShareOpen: (open: boolean) => void
  setTemplatesOpen: (open: boolean) => void
  setSaveStatus: (status: SaveStatus) => void
}

const WorkspaceBridgeContext = createContext<WorkspaceBridgeValue | null>(null)

export function useWorkspaceBridge() {
  const ctx = useContext(WorkspaceBridgeContext)
  if (!ctx) throw new Error("useWorkspaceBridge must be used within WorkspaceBridgeProvider")
  return ctx
}

export function useOptionalWorkspace() {
  return useContext(WorkspaceBridgeContext)
}

export function WorkspaceBridgeProvider({
  value,
  children,
}: {
  value: WorkspaceBridgeValue
  children: React.ReactNode
}) {
  return (
    <WorkspaceBridgeContext.Provider value={value}>
      {children}
    </WorkspaceBridgeContext.Provider>
  )
}
