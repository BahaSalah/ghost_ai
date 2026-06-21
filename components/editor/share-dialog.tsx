"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Copy, Check, UserPlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useOptionalWorkspace } from "./workspace-context"

interface Collaborator {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
}

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const workspace = useOptionalWorkspace()
  const projectId = workspace?.projectId
  const projectRole = workspace?.projectRole
  const isOwner = projectRole === "owner"

  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const prevOpenRef = useRef(false)

  const fetchCollaborators = useCallback(async () => {
    if (!projectId) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`)
      if (res.ok) {
        const data = await res.json()
        setCollaborators(data.collaborators ?? [])
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (open && !prevOpenRef.current && projectId) {
      fetchCollaborators()
    }
    if (!open && prevOpenRef.current) {
      setInviteEmail("")
      setInviteError(null)
      setCopied(false)
    }
    prevOpenRef.current = open
  }, [open, projectId, fetchCollaborators])

  const handleInvite = async () => {
    if (!projectId || !inviteEmail.trim()) return
    setIsInviting(true)
    setInviteError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      if (res.ok) {
        const newCollab = await res.json()
        setCollaborators((prev) => [...prev, newCollab])
        setInviteEmail("")
      } else {
        const err = await res.json()
        setInviteError(err.error ?? "Failed to invite")
      }
    } catch {
      setInviteError("Failed to invite")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async (email: string) => {
    if (!projectId) return
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setCollaborators((prev) => prev.filter((c) => c.email !== email))
      }
    } catch {
      // silently fail
    }
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/editor/${projectId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getInitials = (collab: Collaborator) => {
    if (collab.displayName) {
      return collab.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return collab.email[0]?.toUpperCase() ?? "?"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            {isOwner
              ? "Invite collaborators by email or share the link."
              : "View who has access to this project."}
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <div className="flex gap-2">
            <Input
              placeholder="colleague@example.com"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInvite()
              }}
              disabled={isInviting}
            />
            <Button
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail.trim()}
              size="sm"
            >
              <UserPlus className="mr-1 h-4 w-4" />
              Invite
            </Button>
          </div>
        )}

        {inviteError && (
          <p className="text-xs text-[var(--state-error)]">{inviteError}</p>
        )}

        <div className="max-h-60 space-y-1 overflow-y-auto">
          {isLoading ? (
            <p className="py-4 text-center text-sm text-[var(--text-muted)]">
              Loading collaborators...
            </p>
          ) : collaborators.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--text-muted)]">
              No collaborators yet.
            </p>
          ) : (
            collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[var(--bg-subtle)]"
              >
                <Avatar size="sm">
                  {collab.avatarUrl && (
                    <AvatarImage src={collab.avatarUrl} alt={collab.displayName ?? collab.email} />
                  )}
                  <AvatarFallback>{getInitials(collab)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm text-[var(--text-primary)]">
                    {collab.displayName ?? collab.email}
                  </p>
                  {collab.displayName && (
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {collab.email}
                    </p>
                  )}
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemove(collab.email)}
                    aria-label={`Remove ${collab.displayName ?? collab.email}`}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1 h-4 w-4" />
                Copy link
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
