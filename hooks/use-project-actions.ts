"use client"

import { useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { ProjectItem } from "@/lib/project-data"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function generateSuffix(): string {
  return Math.random().toString(36).substring(2, 6)
}

export type ProjectActions = ReturnType<typeof useProjectActions>

export function useProjectActions(initial: { owned: ProjectItem[]; shared: ProjectItem[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const [projects, setProjects] = useState(initial)
  const [isLoading, setIsLoading] = useState(false)

  const [activeDialog, setActiveDialog] = useState<"create" | "rename" | "delete" | null>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)
  const [createName, setCreateName] = useState("")
  const [renameName, setRenameName] = useState("")

  const slug = slugify(createName)

  const openCreate = useCallback(() => {
    setCreateName("")
    setSelectedProject(null)
    setActiveDialog("create")
  }, [])

  const openRename = useCallback((project: ProjectItem) => {
    setSelectedProject(project)
    setRenameName(project.name)
    setActiveDialog("rename")
  }, [])

  const openDelete = useCallback((project: ProjectItem) => {
    setSelectedProject(project)
    setActiveDialog("delete")
  }, [])

  const closeDialog = useCallback(() => {
    setActiveDialog(null)
    setSelectedProject(null)
    setIsLoading(false)
  }, [])

  const handleCreate = useCallback(async () => {
    if (!createName.trim()) return
    setIsLoading(true)

    const suffix = generateSuffix()
    const roomId = slugify(createName) || `project-${suffix}`

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim(), id: roomId }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to create project")
      }

      const project = await res.json()
      setProjects((prev) => ({
        ...prev,
        owned: [{ id: project.id, name: project.name, role: "owner" as const }, ...prev.owned],
      }))

      closeDialog()
      router.push(`/editor/${project.id}`)
    } catch (e) {
      console.error(e)
      setIsLoading(false)
    }
  }, [createName, closeDialog, router])

  const handleRename = useCallback(async () => {
    if (!selectedProject || !renameName.trim()) return
    setIsLoading(true)

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameName.trim() }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to rename project")
      }

      setProjects((prev) => {
        const update = (list: ProjectItem[]) =>
          list.map((p) =>
            p.id === selectedProject.id ? { ...p, name: renameName.trim() } : p
          )
        return {
          owned: update(prev.owned),
          shared: update(prev.shared),
        }
      })

      closeDialog()
      router.refresh()
    } catch (e) {
      console.error(e)
      setIsLoading(false)
    }
  }, [selectedProject, renameName, closeDialog, router])

  const handleDelete = useCallback(async () => {
    if (!selectedProject) return
    setIsLoading(true)

    const isActiveWorkspace = pathname === `/editor/${selectedProject.id}`

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to delete project")
      }

      setProjects((prev) => ({
        owned: prev.owned.filter((p) => p.id !== selectedProject.id),
        shared: prev.shared.filter((p) => p.id !== selectedProject.id),
      }))

      closeDialog()

      if (isActiveWorkspace) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    } catch (e) {
      console.error(e)
      setIsLoading(false)
    }
  }, [selectedProject, pathname, closeDialog, router])

  return {
    ownedProjects: projects.owned,
    sharedProjects: projects.shared,
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
    handleCreate,
    handleRename,
    handleDelete,
  }
}
