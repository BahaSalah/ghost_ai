# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Spec UI integration (29-spec-ui-integration.md)

## Current Goal

- Integrate spec generation into the editor: spec list, preview modal, download from UI

## In Progress

- (none)

## Completed

- Spec UI integration (29-spec-ui-integration.md) ✓
  - `app/api/projects/[projectId]/specs/route.ts` — `GET` route: authenticates user, verifies project access, returns specs list ordered by createdAt desc
  - `components/editor/ai-sidebar.tsx` — Specs tab replaced mock with real spec list fetched from backend; each item shows formatted date, clock icon, click to preview, download button; preview modal (`Dialog`) fetches Markdown content via download endpoint and renders with `react-markdown` + `@tailwindcss/typography` prose styles; modal has close and download actions; keyboard support via Dialog
  - `react-markdown` installed for rendering; `@tailwindcss/typography` installed for prose styling
  - Zero TS errors, build passes

- Spec persistence and download (28-spec-persistence-download.md) ✓
  - `prisma/models/project-spec.prisma` — `ProjectSpec` model with `id`, `projectId` (relation to Project via `specs` on Project), `filePath`, `createdAt`; migration created and applied
  - `trigger/generate-spec.ts` — After generation: uploads Markdown to Vercel Blob at `specs/{projectId}/{roomId}.md` with `access: "private"`, creates `ProjectSpec` record with the Blob URL; returns `{ spec, blobUrl, specId }`; follows same metadata + Blob pattern as canvas persistence
  - `app/api/projects/[projectId]/specs/[specId]/download/route.ts` — `GET` route: authenticates user, verifies project access (owner/collaborator), verifies spec belongs to project, fetches content from Vercel Blob via `get()`, returns as Markdown attachment with `Content-Disposition: attachment`
  - Zero TS errors, build passes

- Spec generation flow (27-spec-generation-flow.md) ✓

- AI chat functional (26-ai-chat-functional.md) ✓
  - `app/api/ai/design/route.ts` — Returns `publicToken` from `auth.createPublicToken` with read scope on the specific run alongside `runId`; imported `auth as triggerAuth` from `@trigger.dev/sdk`
  - `components/editor/ai-sidebar.tsx` — On submit: pushes user message to `ai-chat` feed, calls `POST /api/ai/design` with `{ prompt, roomId, projectId }`, reads `{ runId, publicToken }` from response; stores both in local state
  - Uses `useRealtimeRun(runId, { accessToken: publicToken, enabled, onComplete })` to track run status in real time
  - `onComplete` callback pushes a final AI message on success or error message on failure, then resets run state
  - Input and send button disabled while run is active; button shows `Loader2` spinner during run
  - Status strip above input: dark base + green accent pulsing dot, shows latest `aiStatusFeed` message, only visible during active runs
  - Chat bubbles styled per spec: user messages green (`#62C073`) with dark text, AI messages dark elevated bg with light text
  - Errors shown as AI assistant messages in `ai-chat` feed instead of inline error state
  - Replaced `sendMessage` with generalized `addChatMessage(name, role)` mutation supporting both user and assistant roles
  - Removed inline `isGenerating`/`latestStatus` blocks in chat body (replaced by status strip)
  - Removed unused `error` state, `CheckCircle`, `AlertCircle` imports
  - Zero TS errors, build passes

- Sidebar chat feed (25-sidebar-chat-feed.md) ✓

- AI presence state (24-ai-presence-state.md) ✓
  - `types/tasks.ts` — Created `AiStatusPayload` type with `message`, `step`, `timestamp`, and optional `text` fields for feed message validation
  - `liveblocks.config.ts` — Added `aiStatusFeed: LiveList<LiveObject<...>>` to Storage type, imported `LiveList`/`LiveObject` from `@liveblocks/client`
  - `components/editor/ai-sidebar.tsx` — Replaced `useEventListener` based status array with `useStorage` reading from shared `aiStatusFeed`; derived `isGenerating` from latest feed item's step (shared across all room participants); chat input and send button disabled while `isGenerating`; send button shows `Loader2` spinner during generation; local `isLoading` set on submit, cleared when feed shows terminal step via `useEffect`; removed unused `StatusMessage` interface and `statusFeed` state
  - `components/editor/live-cursors.tsx` — Imported `Loader2` from lucide-react; reads `isThinking` from presence; renders inline spinner in cursor name badge when `isThinking` is true
  - `workspace-content.tsx` — Added `initialStorage` to `RoomProvider` with empty `aiStatusFeed` LiveList; imported `LiveList`/`LiveObject` from `@liveblocks/client`
  - `trigger/design-agent.ts` — Replaced fire-and-forget `broadcast()` with async `pushStatus()` that writes to `aiStatusFeed` storage via `liveblocks.mutateStorage` AND broadcasts event for real-time listeners; added `userId` to task payload; calls `liveblocks.setPresence` to set `isThinking: true/false` per user during generation; imported `LiveList`, `LiveObject` from `@liveblocks/node`
  - `app/api/ai/design/route.ts` — Passes `userId` from Clerk auth to the design agent task payload
  - Build verified: zero TS errors

- Design agent AI logic (23-design-agent-logic.md) ✓
  - `trigger/design-agent.ts` — Full AI agent: reads canvas state via Liveblocks `getStorageDocument`, interprets prompts with Gemini (`@ai-sdk/google`), generates structured actions (add/move/resize/update/delete nodes, add/delete edges), applies changes via `mutateFlow` from `@liveblocks/react-flow/node`, broadcasts real-time status events (`liveblocks.broadcastEvent`) at each step (start → processing → complete/error)
  - Supported actions: add-node, move-node, resize-node, update-node, delete-node, add-edge, delete-edge
  - Design rules enforced: 6 node shapes, 8-color palette, clamp positioning/sizing, valid color/shape filtering
  - Canvas context sent to Gemini (existing node/edge counts) for smarter generations
  - Errors caught gracefully with error event broadcast and task failure
  - `liveblocks.config.ts` — RoomEvent typed as `{ type, message, step, timestamp }` for `useEventListener`
  - `components/editor/ai-sidebar.tsx` — wired `handleSubmit` to `POST /api/ai/design`, added `useEventListener` for real-time AI status feed (loading spinner, message bubbles with step icons), starter prompt chips now populate input on click
  - No canvas architecture changes, no new state system outside Liveblocks

- Design agent API (22-design-agent-api.md) ✓

- Canvas autosave (21-canvas-autosave.md) ✓
  - `@vercel/blob` installed
  - `prisma/models/project.prisma` — renamed `canvasJsonPath` to `canvasBlobUrl` with `@map` for backward compatibility
  - `app/api/projects/[projectId]/canvas/route.ts` — PUT route uploads canvas JSON to Vercel Blob and stores URL on project record; GET route fetches saved canvas from Vercel Blob using stored URL; both routes support owner and collaborator access
  - `hooks/use-canvas-autosave.ts` — watches Liveblocks nodes/edges, debounces saves (2s), tracks idle/saving/saved/error status
  - `components/editor/workspace-content.tsx` — initial canvas load on mount from saved Vercel Blob, skips if room already has nodes/edges (active collaboration), wired autosave hook
  - `components/editor/workspace-context.tsx` — bridge extended with `saveStatus`/`setSaveStatus`
  - `components/editor/editor-shell.tsx` — saveStatus state wired through bridge
  - `components/editor/editor-navbar.tsx` — save status indicator (Saving.../Saved/Save failed) shown next to project name in center area
  - Build verified: zero TS errors

- Presence avatars and cursors (19-presence-avatars-cursors.md) ✓
  - `components/editor/collaborator-avatars.tsx` — `useOthers()` + `useUser()` double-safety filter, AvatarGroup stack with up to 5 avatars and +N overflow chip, profile photos with initials fallback, visible avatars only for non-self Clerk users
  - `components/editor/live-cursors.tsx` — fixed-position SVG pointer with name badge colored from each participant's `info.color`, filters out self via Clerk user ID
  - `workspace-content.tsx` — replaced built-in `<Cursors>` with `useMyPresence` cursor broadcasting on `onMouseMove`, cursor cleared to `null` on `onMouseLeave`, `CollaboratorAvatars` rendered as absolute overlay at top-right of canvas, `LiveCursors` rendered as fixed overlay
  - Navbar unchanged (editor home and canvas use same component, presences only appear inside the canvas RoomProvider)
  - Presence type (`cursor`, `isThinking`) already defined in `liveblocks.config.ts` — no change needed
  - Build verified: zero TS errors

- AI sidebar shell (20-ai-sidebar-shell.md) ✓
  - `components/editor/ai-sidebar.tsx` — extracted sidebar component with header (bot icon, "AI Workspace" title, "Collaborate with Ghost AI" subtitle, close button), tabbed layout (AI Architect / Specs), empty state with starter prompt chips, auto-resizing textarea with send button, and demo spec card with file icon/snippet/disabled download
  - `components/editor/workspace-content.tsx` — replaced inline placeholder aside with `<AiSidebar />`, removed unused `isAiOpen` destructuring
  - Existing floating slide-in behavior preserved (conditional render controlled by parent via workspace bridge)
  - Build verified: zero TS errors

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



## In Progress

- (none)

## Completed

- Trigger.dev integration (trigger.dev-setup.md) ✓
  - `@trigger.dev/sdk` v4.4.6, `@trigger.dev/build`, `@trigger.dev/react-hooks` installed
  - `trigger.config.ts` — project config with `modern` Prisma extension mode (compatible with Prisma 7 `prisma-client` provider)
  - `trigger/init.ts` — global `onStartAttempt`, `onSuccess`, `onFailure` lifecycle hooks
  - `trigger/hello-world.ts` — example task for verifying setup
  - `trigger/ai-design-generation.ts` — placeholder task for AI architecture generation (TODO: wire AI provider)
  - `trigger/ai-spec-generation.ts` — placeholder task for AI spec generation (TODO: wire AI provider)
  - `package.json` — `trigger:dev` and `trigger:deploy` scripts added
  - `.env.local` — `TRIGGER_SECRET_KEY` and `TRIGGER_PROJECT_REF` placeholder entries added
  - Build verified: zero TS errors
  - `.pnp.cjs` — shadow file at project root to prevent esbuild from loading the global Yarn PnP manifest at `~/.pnp.cjs`, which blocked `@trigger.dev/core` resolution for the trigger.dev CLI worker

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
