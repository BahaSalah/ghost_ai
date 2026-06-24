"use client"

import { useState } from "react"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"
import { CreateProjectDialog } from "./create-project-dialog"
import { RenameProjectDialog } from "./rename-project-dialog"
import { DeleteProjectDialog } from "./delete-project-dialog"
import { ShareDialog } from "./share-dialog"
import { ProjectDialogProvider } from "@/hooks/use-project-dialogs"
import { useProjectActions } from "@/hooks/use-project-actions"
import { WorkspaceBridgeProvider } from "./workspace-context"
import type { ProjectItem } from "@/lib/project-data"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"

export function EditorShell({
  children,
  initialProjects,
}: {
  children: React.ReactNode
  initialProjects: { owned: ProjectItem[]; shared: ProjectItem[] }
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [projectRole, setProjectRole] = useState<"owner" | "collaborator" | null>(null)
  const [isAiOpen, setAiOpen] = useState(false)
  const [isShareOpen, setShareOpen] = useState(false)
  const [isTemplatesOpen, setTemplatesOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const actions = useProjectActions(initialProjects)

  return (
    <WorkspaceBridgeProvider value={{ projectId, projectName, projectRole, isAiOpen, isShareOpen, isTemplatesOpen, saveStatus, setProjectId, setProjectName, setProjectRole, setAiOpen, setShareOpen, setTemplatesOpen, setSaveStatus }}>
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
          <main className="flex flex-1 flex-col">{children}</main>
          <CreateProjectDialog />
          <RenameProjectDialog />
          <DeleteProjectDialog />
          <ShareDialog open={isShareOpen} onOpenChange={setShareOpen} />
        </div>
      </ProjectDialogProvider>
    </WorkspaceBridgeProvider>
  )
}
