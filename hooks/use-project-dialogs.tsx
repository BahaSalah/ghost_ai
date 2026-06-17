"use client"

import { useState, useCallback, createContext, useContext } from "react"

export interface Project {
  id: string
  name: string
  role: "owner" | "collaborator"
}

interface ProjectDialogContextValue {
  activeDialog: "create" | "rename" | "delete" | null
  selectedProject: Project | null
  isCreateOpen: boolean
  isRenameOpen: boolean
  isDeleteOpen: boolean
  createName: string
  setCreateName: (name: string) => void
  renameName: string
  setRenameName: (name: string) => void
  slug: string
  isLoading: boolean
  openCreate: () => void
  openRename: (project: Project) => void
  openDelete: (project: Project) => void
  closeDialog: () => void
}

const ProjectDialogContext = createContext<ProjectDialogContextValue | null>(null)

export function useProjectDialogs() {
  const ctx = useContext(ProjectDialogContext)
  if (!ctx) {
    throw new Error("useProjectDialogs must be used within ProjectDialogProvider")
  }
  return ctx
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function useProjectDialogState() {
  const [activeDialog, setActiveDialog] = useState<"create" | "rename" | "delete" | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [createName, setCreateName] = useState("")
  const [renameName, setRenameName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const slug = slugify(createName)

  const resetCreate = useCallback(() => {
    setCreateName("")
  }, [])

  const openCreate = useCallback(() => {
    resetCreate()
    setSelectedProject(null)
    setActiveDialog("create")
  }, [resetCreate])

  const openRename = useCallback((project: Project) => {
    setSelectedProject(project)
    setRenameName(project.name)
    setActiveDialog("rename")
  }, [])

  const openDelete = useCallback((project: Project) => {
    setSelectedProject(project)
    setActiveDialog("delete")
  }, [])

  const closeDialog = useCallback(() => {
    setActiveDialog(null)
    setSelectedProject(null)
    setIsLoading(false)
  }, [])

  return {
    activeDialog,
    selectedProject,
    isCreateOpen: activeDialog === "create",
    isRenameOpen: activeDialog === "rename",
    isDeleteOpen: activeDialog === "delete",
    createName,
    setCreateName,
    renameName,
    setRenameName,
    slug,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
  }
}

export const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "Design System", role: "owner" },
  { id: "2", name: "Mobile App Redesign", role: "owner" },
  { id: "3", name: "Dashboard", role: "collaborator" },
]

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
