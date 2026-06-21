"use client"

import { PanelLeftOpen, PanelLeftClose, Share2, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import { useOptionalWorkspace } from "./workspace-context"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function EditorNavbar({ isSidebarOpen, onToggleSidebar }: EditorNavbarProps) {
  const workspace = useOptionalWorkspace()
  const projectName = workspace?.projectName
  const isAiOpen = workspace?.isAiOpen ?? false
  const setAiOpen = workspace?.setAiOpen
  const setShareOpen = workspace?.setShareOpen

  return (
    <nav className="flex h-12 items-center border-b border-[var(--border-default)] bg-[var(--bg-elevated)] px-4">
      <div className="flex flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center">
        {projectName && (
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {projectName}
          </span>
        )}
      </div>
      <div className="flex flex-1 items-center justify-end gap-1">
        {projectName && (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Share project"
              onClick={() => setShareOpen?.(true)}
            >
              <Share2 />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle AI sidebar"
              onClick={() => setAiOpen?.(!isAiOpen)}
              data-active={isAiOpen || undefined}
              className="data-[active]:text-[var(--accent-ai-text)]"
            >
              <Bot />
            </Button>
          </>
        )}
        <UserButton />
      </div>
    </nav>
  )
}
