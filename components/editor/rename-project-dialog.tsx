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
  const { isRenameOpen, closeDialog, selectedProject, renameName, setRenameName } =
    useProjectDialogs()

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        closeDialog()
      }
    },
    [closeDialog]
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
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
