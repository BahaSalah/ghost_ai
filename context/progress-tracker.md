# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Sharing feature (complete)

## Current Goal

- Share dialog — workspace sharing with invite, remove, and Clerk-enriched collaborator list

## Completed

- Clerk authentication set up via Clerk CLI (app: Ghost AI, app_3FDu0MU9Q2Tt94lX7IrsC9FlLBK)
- @clerk/nextjs installed, ClerkProvider wrapped in layout.tsx
- proxy.ts created with clerkMiddleware, matcher includes `'/__clerk/:path*'`
- Sign-in (app/(auth)/sign-in/[[...sign-in]]/page.tsx) and sign-up (app/(auth)/sign-up/[[...sign-up]]/page.tsx) pages created
- Clerk auth controls (UserButton) added to EditorNavbar
- clerk doctor: all checks pass
- Stripped Next.js boilerplate (globals.css, page.tsx, public SVGs)
- shadcn/ui initialized with base-nova preset (base-ui/react)
- Dark-only theme configured in globals.css (no light mode)
- Custom dark tokens mapped via @theme inline per ui-context.md
- Installed lucide-react, clsx, tailwind-merge
- Created lib/utils.ts with cn() helper
- Added components: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea
- Dialog pattern ready: title via DialogTitle, description via DialogDescription, footer via DialogFooter
- Created `components/editor/editor-navbar.tsx` — fixed-height top navbar with sidebar toggle, left/center/right sections, dark elevated background
- Created `components/editor/project-sidebar.tsx` — fixed-position sidebar that slides from left, with Projects/Shared tabs and New Project button
- Created `components/editor/editor-shell.tsx` — client component managing sidebar state, composing navbar + sidebar
- Updated `app/layout.tsx` — imports EditorShell, wraps children with editor chrome
- Updated `app/page.tsx` — cleaned up to match editor context
- Build verified: no TS or compilation errors, lint passes
- Clerk dark theme (`@clerk/ui/themes`) wired into ClerkProvider with CSS variable overrides
- Restructured route groups: `(auth)` for sign-in/up pages without editor shell, `(editor)` for editor routes with shell
- Two-panel auth layout: left panel with logo/tagline/features, right panel with Clerk form (responsive — form only on small screens)
- Home page (`/`) redirects authenticated users to `/editor`, unauthenticated to `/sign-in`
- EditorNavbar simplified to show only UserButton (editor is protected anyway)
- proxy.ts protects all routes except /sign-in and /sign-up
- `@clerk/ui` already installed (v1.17.0)
- `hooks/use-project-dialogs.tsx` — context-based hook managing dialog state, form state (create name, rename name, slug generation), and loading state
- `components/editor/create-project-dialog.tsx` — name input + live slug preview
- `components/editor/rename-project-dialog.tsx` — prefilled input, description shows current name, auto-focus, Enter submits
- `components/editor/delete-project-dialog.tsx` — destructive confirmation dialog
- `components/editor/editor-shell.tsx` — wired ProjectDialogProvider, renders all three dialogs
- `components/editor/project-sidebar.tsx` — mock project list, rename/delete actions (owned only), New Project button wired, mobile backdrop scrim
- `app/(editor)/editor/page.tsx` — editor home with heading, description, New Project button
- Build verified: zero TS errors, zero lint errors
- Wire editor home (07-wire-editor-home.md) — sidebar/dialogs wired to real project API ✓
  - `lib/project-data.ts` — server-side helper fetching owned + shared projects via Prisma + Clerk
  - `hooks/use-project-actions.ts` — combined dialog state + mutation hook (create/rename/delete)
  - `app/(editor)/layout.tsx` — fetches projects server-side, passes to EditorShell
  - `components/editor/editor-shell.tsx` — uses useProjectActions, provides via ProjectDialogProvider
  - `components/editor/project-sidebar.tsx` — reads real owned/shared projects from context, no mock data
  - Dialogs wired: Create calls POST /api/projects with custom slug ID, navigates to workspace; Rename calls PATCH; Delete calls DELETE, redirects if active workspace
  - `app/(editor)/editor/page.tsx` — server component fetching own project counts
  - `app/api/projects/route.ts` — POST accepts optional `id` for project/room alignment
  - Build verified: zero TS errors, zero lint errors

## In Progress

(none)

## Next Up

- Real canvas logic, Liveblocks, AI chat

## Completed (continued)

- Editor workspace shell (08-editor-workspace-shell.md) ✓
  - `lib/project-access.ts` — `getCurrentIdentity()` and `getProjectForUser()` helpers
  - `components/editor/access-denied.tsx` — centered layout, lock icon, link back to `/editor`
  - `components/editor/workspace-context.tsx` — context providing projectName + AI sidebar state to navbar
  - `components/editor/editor-navbar.tsx` — reads workspace context; shows project name in center, share + AI toggle buttons when in workspace mode
  - `components/editor/project-sidebar.tsx` — highlights active room via `useParams()`, items link to `/editor/[id]`
  - `components/editor/workspace-content.tsx` — full-viewport canvas area (dark bg, centered message) + toggleable AI sidebar placeholder
  - `app/(editor)/editor/[roomId]/page.tsx` — server component: unauthenticated → redirect `/sign-in`, no access → `AccessDenied`, otherwise renders workspace
- Share dialog (09-share-dialog.md) ✓
- Prisma schema and data layer (05-prisma.md) ✓
- Project APIs (06-project-apis.md) ✓
  - `app/api/projects/route.ts` — GET (list), POST (create) with ownerId from Clerk auth
  - `app/api/projects/[projectId]/route.ts` — PATCH (rename), DELETE with owner check
  - Unauthenticated → 401, non-owner mutation → 403, not found → 404
  - Default name "Untitled Project", schema UUID strategy preserved
  - Build verified: zero TS errors
  - `prisma/models/project.prisma` — Project and ProjectCollaborator models with proper relations, indexes, unique constraints, and enums
  - `lib/prisma.ts` — cached PrismaClient singleton with DATABASE_URL branching (Accelerate vs direct pg adapter)
  - Initial migration created and applied — both tables created with all indexes and foreign keys
  - Build & lint verified: zero errors

## Open Questions



## Architecture Decisions

- Dark-only: shadcn dark theme variables moved to :root, no .dark class dependency
- Theme tokens defined in globals.css with both raw CSS vars and @theme inline mapping for Tailwind v4

## Session Notes

- shadcn init used `--defaults` (base-nova preset with @base-ui/react primitives)
- Build verified: no TS or compilation errors
- globals.css imports: tailwindcss, tw-animate-css, shadcn/tailwind.css
- Share dialog: workspace bridge extended with `projectId`, `projectRole`, `isShareOpen`; Clerk Backend API enriches collaborator emails with display name + avatar
