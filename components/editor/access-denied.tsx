import { Lock } from "lucide-react"
import Link from "next/link"

export function AccessDenied() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--bg-subtle)]">
        <Lock className="size-6 text-[var(--text-muted)]" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-medium text-[var(--text-primary)]">Access Denied</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          You don&apos;t have access to this project.
        </p>
      </div>
      <Link
        href="/editor"
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap text-[var(--text-primary)] transition-all hover:bg-muted hover:text-foreground"
      >
        Back to Editor
      </Link>
    </div>
  )
}
