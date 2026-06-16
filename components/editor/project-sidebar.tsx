"use client"

import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
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
            <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
              No projects yet.
            </p>
          </TabsContent>
          <TabsContent value="shared">
            <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
              No shared projects yet.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="border-t border-[var(--border-default)] p-4">
        <Button className="w-full">
          <Plus data-icon="inline-start" />
          New Project
        </Button>
      </div>
    </aside>
  )
}
