"use client"

import { useCallback } from "react"
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

export function RenameProjectDialog() {
  const { isRenameOpen, closeDialog, selectedProject, renameName, setRenameName, isLoading, handleRename } =
    useProjectDialogs()

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && renameName.trim()) {
        handleRename()
      }
    },
    [renameName, handleRename]
  )

  return (
    <Dialog open={isRenameOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Rename &ldquo;{selectedProject?.name}&rdquo; to something new.
          </DialogDescription>
        </DialogHeader>

        <Input
          value={renameName}
          onChange={(e) => setRenameName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={!renameName.trim() || isLoading}>
            {isLoading ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
