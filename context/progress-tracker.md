# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Auth integration (complete)

## Current Goal

- Auth integration — Clerk dark theme, two-panel auth pages, route protection, home page redirect

## Completed

- Clerk authentication set up via Clerk CLI (app: Ghost AI, app_3FDu0MU9Q2Tt94lX7IrsC9FlLBK)
- @clerk/nextjs installed, ClerkProvider wrapped in layout.tsx
- proxy.ts created with clerkMiddleware, matcher includes `'/__clerk/:path*'`
- Sign-in (app/sign-in/[[...sign-in]]/page.tsx) and sign-up (app/sign-up/[[...sign-up]]/page.tsx) pages created
- Clerk auth controls (SignInButton, SignUpButton, UserButton) added to EditorNavbar
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

## In Progress

- None.

## Next Up

- TBD — next feature unit

## Open Questions



## Architecture Decisions

- Dark-only: shadcn dark theme variables moved to :root, no .dark class dependency
- Theme tokens defined in globals.css with both raw CSS vars and @theme inline mapping for Tailwind v4

## Session Notes

- shadcn init used `--defaults` (base-nova preset with @base-ui/react primitives)
- Build verified: no TS or compilation errors
- globals.css imports: tailwindcss, tw-animate-css, shadcn/tailwind.css
