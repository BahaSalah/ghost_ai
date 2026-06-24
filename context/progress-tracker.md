# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- (none — ready for next feature)

## Current Goal

- (none — completed starter templates feature)

## In Progress

- (none)

## Completed

- Starter templates (18-starter-templates.md) ✓
  - `components/editor/starter-templates.ts` — CanvasTemplate type, CANVAS_TEMPLATES array with microservices, CI/CD pipeline, and event-driven system templates
  - `components/editor/starter-templates-modal.tsx` — dialog with scrollable grid of template cards, lightweight SVG preview (node shapes + edge lines, no React Flow), import button per card
  - Workspace bridge extended with `isTemplatesOpen`/`setTemplatesOpen`
  - Navbar: LayoutTemplate button opens the starter templates modal
  - Import handler: clears existing nodes/edges, adds template nodes/edges with prefixed IDs, fits view after 50ms delay
  - Build verified: zero TS errors

## Completed

- Canvas ergonomics (17-canvas-ergonomics.md) ✓
  - `components/editor/canvas-control-bar.tsx` — pill-shaped control bar at bottom-left (above shape panel) with zoom group (zoom out, fit view, zoom in) and history group (undo, redo), separated by a thin divider
  - Zoom controls wired to `reactFlowInstance.zoomIn/zoomOut/fitView` with 200ms animation duration
  - Undo/redo wired to Liveblocks (`useUndo`, `useRedo`, `useCanUndo`, `useCanRedo`)
  - Disabled undo/redo buttons visually dimmed via `disabled:opacity-30`
  - `hooks/use-keyboard-shortcuts.ts` — listens on `window`, ignores shortcuts in inputs/textareas/contenteditable
  - Shortcuts: `+`/`=` zoom in, `-` zoom out, `Cmd/Ctrl+Z` undo, `Cmd/Ctrl+Shift+Z` or `Cmd/Ctrl+Y` redo
  - Build verified: zero TS errors

- Edge behavior (16-edge-behavior.md) ✓
  - CanvasEdgeData type extended with optional `label` field
  - Handle CSS in globals.css: hidden by default (opacity: 0), fade in on node hover via `.react-flow__node:hover .handle-connect`
  - NodeHandles component: 8 handles (source + target at each of top/right/bottom/left), 8px white dots with dark border
  - CanvasEdgeRenderer: smooth-step path, dimmed at rest (opacity 0.35), bright on hover/select, 20px invisible hit area
  - Arrow rendered as polygon at path endpoint based on targetPosition
  - Inline labels via EdgeLabelRenderer: double-click to edit, blur/Enter/Escape to save, pill badge display, faint hint on active no-label edges
  - Label input styled with growing width, stops drag/pan propagation
  - defaultEdgeOptions set to type "canvasEdge" with matching dimmed style
  - Build verified: zero TS errors

- Node color toolbar (15-node-color-toolbar.md) ✓
  - NodeResizer on selected nodes with min size constraints
  - Inline label editing with textarea overlay
  - Double-click to edit, blur/Escape to close
  - Label updates synced via Liveblocks onNodesChange
  - Build verified: zero TS errors

- Node shape rendering and drag preview (13-node-shape.md) ✓
  - CSS shapes: rectangle, pill, circle
  - SVG shapes: diamond, hexagon, cylinder
  - Borders subtle at rest, brighter when selected
  - Drag ghost preview attached to cursor
  - Fixed node connections: Handle components as siblings, explicit handle sizing
  - Build verified: zero TS errors

## Completed

- Base collaborative canvas (11-base-canvas.md) ✓
  - `types/canvas.ts` — shared types for CanvasNodeData (label, color, shape), CanvasNode, CanvasEdge
  - `components/editor/workspace-content.tsx` — replaces placeholder with Liveblocks-backed React Flow canvas
  - LiveblocksProvider (`/api/liveblocks-auth`) → RoomProvider (roomId from URL params) → ClientSideSuspense (loading state)
  - CanvasErrorBoundary class component for Liveblocks connection failure fallback
  - `useErrorListener` for runtime disconnect error state
  - `useLiveblocksFlow({ suspense: true })` with empty initial nodes/edges
  - ReactFlow with fitView, colorMode="dark", loose connections
  - MiniMap (dark styled) + dot-pattern Background + Cursors from @liveblocks/react-flow
  - AI sidebar preserved and conditionally rendered via workspace bridge
  - `@xyflow/react` base + style CSS imported in globals.css
  - Build verified: zero TS errors
- Liveblocks realtime collaboration setup (10-liveblocks-setup.md) ✓
  - `liveblocks.config.ts` — defines Presence (cursor, isThinking) and UserMeta (id, name, avatar, color)
  - `lib/liveblocks.ts` — cached Liveblocks node client singleton, deterministic `getUserColor()` helper mapping user ID to a 16-color palette
  - `app/api/liveblocks-auth/route.ts` — POST endpoint requiring Clerk auth, verifying project access via `getProjectForUser`, creating room with Liveblocks, issuing access token with user metadata (name, avatar, color)
  - 403 returned for unauthorized project access, 401 for unauthenticated
  - `@liveblocks/node` installed
  - Build verified: zero TS errors, zero lint errors
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

## Completed (continued)

- Shape drag-to-create panel (12-shape-panel.md) ✓
  - `components/editor/shape-panel.tsx` — floating pill-shaped toolbar at bottom-center with draggable shape buttons (rectangle, diamond, circle, pill, cylinder, hexagon)
  - `components/editor/canvas-node-renderer.tsx` — custom node renderer for `canvasNode` type, renders as bordered rectangle with centered label
  - `components/editor/workspace-content.tsx` — `nodeTypes` registered on ReactFlow, `onDragOver`/`onDrop` handling on canvas wrapper, `screenToFlowPosition` for coordinate conversion, node ID generation using shape+timestamp+counter
  - Shape drag payload includes shape name, width, height in `application/json` format
  - On drop: reads shape payload, converts screen coords to flow coords, creates new node with empty label, default color (`#505068`), and dropped shape
  - Build verified: zero TS errors
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
- Liveblocks auth: `@liveblocks/node` server SDK used for room management and token issuance (access tokens via `prepareSession` + `allow` + `authorize`), room as private (`defaultAccesses: []`) with per-user access granted server-side
- Cursor colors: deterministic mapping from user ID hash to 16-color fixed palette, generated server-side during auth
- Collaborative canvas: `useLiveblocksFlow` manages Shared Storage (LiveMap-based nodes/edges) and provides React Flow change handlers; `Cursors` component uses Presence for multiplayer cursor display
- Error handling: `CanvasErrorBoundary` (class component wrapping Liveblocks tree) for Suspense/initialization errors, `useErrorListener` hook for runtime disconnect handling inside the room

## Session Notes

- shadcn init used `--defaults` (base-nova preset with @base-ui/react primitives)
- Build verified: no TS or compilation errors
- globals.css imports: tailwindcss, tw-animate-css, shadcn/tailwind.css
- Share dialog: workspace bridge extended with `projectId`, `projectRole`, `isShareOpen`; Clerk Backend API enriches collaborator emails with display name + avatar
- Liveblocks implementation uses `@liveblocks/node` (installed separately from frontend Liveblocks packages) for server-side room and token operations
