"use client"

import { useState } from "react"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"
import { CreateProjectDialog } from "./create-project-dialog"
import { RenameProjectDialog } from "./rename-project-dialog"
import { DeleteProjectDialog } from "./delete-project-dialog"
import { ProjectDialogProvider } from "@/hooks/use-project-dialogs"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { ProjectItem } from "@/lib/project-data"

export function EditorShell({
  children,
  initialProjects,
}: {
  children: React.ReactNode
  initialProjects: { owned: ProjectItem[]; shared: ProjectItem[] }
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const actions = useProjectActions(initialProjects)

  return (
    <ProjectDialogProvider value={actions}>
      <div className="flex min-h-screen flex-col">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1">{children}</main>
        <CreateProjectDialog />
        <RenameProjectDialog />
        <DeleteProjectDialog />
      </div>
    </ProjectDialogProvider>
  )
}
