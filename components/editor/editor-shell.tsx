"use client"

import { useState } from "react"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"
import { CreateProjectDialog } from "./create-project-dialog"
import { RenameProjectDialog } from "./rename-project-dialog"
import { DeleteProjectDialog } from "./delete-project-dialog"
import {
  useProjectDialogState,
  ProjectDialogProvider,
} from "@/hooks/use-project-dialogs"

function EditorShellInner({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
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
  )
}

export function EditorShell({ children }: { children: React.ReactNode }) {
  const dialogState = useProjectDialogState()

  return (
    <ProjectDialogProvider value={dialogState}>
      <EditorShellInner>{children}</EditorShellInner>
    </ProjectDialogProvider>
  )
}
