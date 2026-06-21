"use client"

import { useWorkspaceBridge } from "./workspace-context"

function WorkspaceCanvas() {
  const { isAiOpen } = useWorkspaceBridge()

  return (
    <div className="flex flex-1">
      <div className="flex flex-1 items-center justify-center bg-[var(--bg-base)]">
        <p className="text-sm text-[var(--text-faint)]">
          Canvas will render here
        </p>
      </div>
      {isAiOpen && (
        <aside className="flex w-80 flex-col border-l border-[var(--border-default)] bg-[var(--bg-elevated)]">
          <div className="flex items-center border-b border-[var(--border-default)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              AI Assistant
            </h2>
          </div>
          <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-center text-sm text-[var(--text-faint)]">
              AI chat will appear here
            </p>
          </div>
        </aside>
      )}
    </div>
  )
}

export function WorkspaceContent() {
  return <WorkspaceCanvas />
}
