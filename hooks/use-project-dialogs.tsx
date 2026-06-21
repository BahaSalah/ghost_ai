"use client"

import { createContext, useContext } from "react"
import type { ProjectItem } from "@/lib/project-data"
import type { ProjectActions } from "./use-project-actions"

export type { ProjectItem }

export type ProjectDialogContextValue = ProjectActions

const ProjectDialogContext = createContext<ProjectDialogContextValue | null>(null)

export function useProjectDialogs() {
  const ctx = useContext(ProjectDialogContext)
  if (!ctx) {
    throw new Error("useProjectDialogs must be used within ProjectDialogProvider")
  }
  return ctx
}

export function ProjectDialogProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: ProjectDialogContextValue
}) {
  return (
    <ProjectDialogContext.Provider value={value}>
      {children}
    </ProjectDialogContext.Provider>
  )
}
