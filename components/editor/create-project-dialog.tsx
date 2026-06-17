"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"

export function CreateProjectDialog() {
  const { isCreateOpen, closeDialog, createName, setCreateName, slug } =
    useProjectDialogs()

  return (
    <Dialog open={isCreateOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Start a new architecture workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-primary)]">Project name</label>
            <Input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="My Project"
              autoFocus
            />
          </div>
          {slug && (
            <div className="space-y-1">
              <span className="text-xs text-[var(--text-muted)]">Slug</span>
              <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-muted)] px-2.5 py-1.5 font-mono text-xs text-[var(--text-secondary)]">
                {slug}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
