# Folio — Survey Studio (web)

Frontend for the Hono / Workers / D1 survey backend.

## Stack

- React 19 + Vite 6
- TanStack Router (file-based, client-side)
- Tailwind CSS v3 (PostCSS, config in `tailwind.config.js`)
- Plain `fetch` wrapper with transparent JWT refresh (`src/lib/api.ts`)

Editorial layout, single coral accent, Fraunces display + Inter body on warm paper. No glassmorphism, no design-system kitchen sink.

## Run

From the repo root:

```bash
pnpm install
pnpm dev   # api :8787, web :5173 (vite proxies /auth, /surveys, /questions, /s, /api → api)
```

> `src/routeTree.gen.ts` is generated automatically by the TanStack Router Vite plugin on first `dev`/`build` — do not edit and do not commit (it's in `.gitignore`).

## Routes

| Path                       | Purpose                              |
| -------------------------- | ------------------------------------ |
| `/`                        | Landing (redirects to `/dashboard` if signed in) |
| `/login`, `/signup`        | Email + password auth                |
| `/dashboard`               | Owner survey list + create           |
| `/surveys/:id/edit`        | Builder (questions, brand, share)    |
| `/surveys/:id/responses`   | Response inspector                   |
| `/s/:slug`                 | Public, branded response form        |

## Decisions worth defending

- **No data-fetching library.** Six routes, no shared cache pressure — plain `useEffect + fetch` keeps the file count down and behaviour obvious. If the app grew (cache invalidation across routes, optimistic mutations at scale) I'd reach for TanStack Query.
- **Tokens in `localStorage` + transparent refresh.** Simpler than wiring HttpOnly cookies through Vite's proxy; the wrapper in `src/lib/api.ts` retries a single 401 once.
- **Optimistic builder edits.** The builder updates state first, then calls the API and reloads on failure. Reordering uses the existing reorder endpoint; field edits save on blur to avoid one API call per keystroke.
- **Brand color drives the public form.** `/s/:slug` is the only surface the owner is *really* trying to brand, so the form derives its accent from `brand_color` — top rule, rating chips, selected options, submit button.
