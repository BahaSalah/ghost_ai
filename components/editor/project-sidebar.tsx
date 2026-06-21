"use client"

import { X, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { ProjectItem } from "@/lib/project-data"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

function ProjectItem({
  project,
  onRename,
  onDelete,
  isActive,
}: {
  project: ProjectItem
  onRename: (p: ProjectItem) => void
  onDelete: (p: ProjectItem) => void
  isActive: boolean
}) {
  const isOwner = project.role === "owner"

  return (
    <Link
      href={`/editor/${project.id}`}
      className={`group flex items-center justify-between rounded-md px-2 py-1.5 ${
        isActive
          ? "bg-[var(--accent-primary-dim)]"
          : "hover:bg-[var(--bg-subtle)]"
      }`}
    >
      <span className={`truncate text-sm ${
        isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"
      }`}>
        {project.name}
      </span>
      {isOwner && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.preventDefault()
              onRename(project)
            }}
            aria-label={`Rename ${project.name}`}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.preventDefault()
              onDelete(project)
            }}
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </Link>
  )
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const { ownedProjects, sharedProjects, openCreate, openRename, openDelete } =
    useProjectDialogs()
  const params = useParams()
  const activeRoomId = params?.roomId as string | undefined

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        data-state={isOpen ? "open" : "closed"}
        className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-xl transition-transform duration-300 data-[state=closed]:-translate-x-full"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Projects</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close sidebar">
            <X />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="my-projects">
            <TabsList className="w-full">
              <TabsTrigger value="my-projects" className="flex-1">My Projects</TabsTrigger>
              <TabsTrigger value="shared" className="flex-1">Shared</TabsTrigger>
            </TabsList>
            <TabsContent value="my-projects">
              {ownedProjects.length === 0 ? (
                <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
                  No projects yet.
                </p>
              ) : (
                <div className="mt-2 space-y-0.5">
                    {ownedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      onRename={openRename}
                      onDelete={openDelete}
                      isActive={project.id === activeRoomId}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="shared">
              {sharedProjects.length === 0 ? (
                <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
                  No shared projects yet.
                </p>
              ) : (
                <div className="mt-2 space-y-0.5">
                    {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      onRename={openRename}
                      onDelete={openDelete}
                      isActive={project.id === activeRoomId}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t border-[var(--border-default)] p-4">
          <Button className="w-full" onClick={openCreate}>
            <Plus data-icon="inline-start" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
