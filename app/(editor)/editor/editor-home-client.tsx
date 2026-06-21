"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"

export function EditorHomeClient({
  ownedCount,
  sharedCount,
}: {
  ownedCount: number
  sharedCount: number
}) {
  const { openCreate } = useProjectDialogs()

  if (ownedCount > 0 || sharedCount > 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Select a project from the sidebar
        </h1>
        <p className="max-w-md text-sm text-[var(--text-muted)]">
          You have {ownedCount} project{ownedCount !== 1 ? "s" : ""}
          {sharedCount > 0 ? ` and ${sharedCount} shared with you` : ""}.
        </p>
        <Button className="mt-2" onClick={openCreate}>
          <Plus data-icon="inline-start" />
          New Project
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
        Create a project or open an existing one
      </h1>
      <p className="max-w-md text-sm text-[var(--text-muted)]">
        Start a new architecture workspace, or choose a project from the sidebar.
      </p>
      <Button className="mt-2" onClick={openCreate}>
        <Plus data-icon="inline-start" />
        New Project
      </Button>
    </div>
  )
}
