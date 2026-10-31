# AGENTS.md

## Project Overview

**www-nextjs-slate** is a minimalist WYSIWYG writing tool built with Next.js, React, and Slate.js. Users create, edit, and publish written content at `nextslate.internet.dev`. The editor stores and renders native Slate nodes with typed blocks (`heading-one`, `block-quote`, `bulleted-list`, etc.) and inline marks (`bold`, `italic`, `underline`, `code`) — there is no markdown parsing or rendering pipeline. The project integrates with the shared backend API at `https://api.internet.dev`.

All branding and domain constants are centralized in `nextjs-slate/common/constants.ts` (`PRODUCT_NAME`, `SITE_DOMAIN`, `SITE_URL`, `COOKIE_NAME`, `POST_TYPE`, `OAUTH_REDIRECT_KEY`). Change these to rebrand or deploy under a different domain.

- **License:** MIT
- **API Backend:** `https://api.internet.dev`

---

## Tech Stack

- **Node.js** >=20.9.0 (the minimum required by Next.js)
- **Next.js** ^16.4 with App Router (not Pages Router, except for `/pages/oauth.tsx`)
- **React** ^19.3 with function components
- **TypeScript** ^7 (strict mode off, strictNullChecks off). TypeScript 7 has no JavaScript compiler API, so `next build` type-checks through the `tsc` CLI, and API-based tools such as `ts-node` do not work
- **Slate.js** ^0.147 for rich text editing (slate, slate-react, slate-dom; slate-history ^0.144)
- **UUID** ^14 (declared dependency; not currently imported by any source file)
- **No state management library** — React state + props only

---

## Directory Structure

```
app/                        → Next.js App Router pages
  ├── page.tsx              → Home page (sign in or welcome)
  ├── layout.tsx            → Root layout
  ├── head.tsx              → Inert: `head.tsx` is not an App Router file convention, so it is never rendered. Page metadata comes from `generateMetadata` in each `page.tsx`
  ├── robots.ts             → SEO robots.txt
  ├── sitemap.ts            → Dynamic sitemap
  ├── -/upgrade/            → Subscription/upgrade page
  └── [username]/           → Dynamic user routes
      ├── page.tsx          → User profile (post list)
      ├── -/[id]/page.tsx   → Post editor (protected)
      └── [slug]/page.tsx   → Public post view
pages/
  └── oauth.tsx             → OAuth callback handler
nextjs-slate/                    → Application source code
  ├── common/               → Shared utilities
  │   ├── constants.ts      → App constants, user tiers
  │   ├── server.ts         → Server-side API calls
  │   ├── http.ts           → Client-side HTTP functions
  │   ├── utilities.ts      → Helper functions
  │   ├── slate.ts          → Slate editor utilities and plugins
  │   └── slate-types.d.ts  → Slate custom type declarations
  ├── components/           → React components + CSS modules
  └── modules/              → Utility modules (cookies, hooks, hotkeys)
scripts/
  └── index.js              → Runner for `npm run script <name>`, which loads `scripts/<name>.js`
skills/
  └── create-next-slate-post/SKILL.md → API guide for creating and publishing posts
```

---

## Path Aliases

Defined in `tsconfig.json`. Always use these aliases instead of relative paths.

| Alias | Maps To |
|---|---|
| `@root/*` | `./*` |
| `@nextjs-slate/*` | `./nextjs-slate/*` |
| `@pages/*` | `./pages/*` |

---

## Routing

**App Router** with dynamic segments:

| Route | Purpose | Access |
|---|---|---|
| `/` | Home page, sign in | Public |
| `/[username]` | User's post list | Public |
| `/[username]/[slug]` | Published post view | Public |
| `/[username]/-/[id]` | Post editor | Owner only |
| `/-/upgrade` | Subscription page | Authenticated |

The `-` segment is a literal path separator for protected routes. All pages use `force-dynamic` (always server-rendered).

---

## Component Conventions

### File Naming

- Components: `PascalCase.tsx` (e.g., `EditablePostWithLayout.tsx`)
- Styles: `PascalCase.module.css` co-located with component
- Utilities/modules: `lowercase.ts` (e.g., `cookies.ts`, `hooks.ts`)

### Component Patterns

- Use `'use client'` directive for interactive components
- Server components (async functions) for data fetching in `app/` pages
- Dynamic imports for client-only components: `dynamic(() => import(...), { ssr: false })`
- Export default for components
- No prop destructuring in function signature — use `props` directly

### Import Style

```tsx
import * as Constants from '@nextjs-slate/common/constants';
import * as Server from '@nextjs-slate/common/server';
import * as HTTP from '@nextjs-slate/common/http';
import * as Utilities from '@nextjs-slate/common/utilities';
import styles from '@nextjs-slate/components/Component.module.css';
```

### Comments

- `//NOTE(jimmylee):` for design decisions (no space after `//`, author name in parens, colon, then description)
- Keep comments minimal

---

## Styling Conventions

### CSS Modules

Every component has a co-located `.module.css` file.

### Global Styles

`global.css` defines the design system:

| Variable | Value |
|---|---|
| `--color-background` | `#fffefe` |
| `--color-text` | `#0e101b` |
| `--color-border` | `#e5e5e5` |
| `--color-primary` | `#0047ff` |
| `--color-success` | `rgba(68, 198, 127, 1)` |
| `--color-error` | `rgba(239, 68, 68, 1)` |

### Design Tokens

- **Spacing:** 8px base (8, 16, 24, 32, 48px)
- **Border radius:** 8px
- **Transitions:** `200ms ease all`
- **Max content width:** 768px
- **Button height:** 48px
- **Input height:** 56px
- **Sidebar width:** 40px

### Fonts

- `'Mono'` — Custom monospace font (S3-hosted WOFF)
- `'System'` — Custom system font (S3-hosted WOFF)

---

## Slate Editor

### Supported Block Types

`paragraph`, `heading-one`, `heading-two`, `block-quote`, `bulleted-list`, `numbered-list`, `list-item`, `image` (supports optional `alt`), `video`, `link`

### Inline Formatting

Bold (`Cmd+B`), Italic (`Cmd+I`), Underline (`Cmd+U`), Code (`Cmd+\``)

### Smart Shortcuts

- `* ` or `- ` or `+ ` → Bulleted list
- `> ` → Block quote
- `# ` → Heading 1
- `## ` → Heading 2

### Media

- Images and videos via drag-drop, file picker, or URL paste
- Uploads to S3 via presigned URL
- Max file size: 15MB

### Editor State Format

```json
{
  "editorContent": {
    "children": [
      { "type": "paragraph", "children": [{ "text": "Hello world" }] }
    ]
  }
}
```

### API Markdown Support

Posts created or updated via the API with a `markdown` field will have their `editorContent.children` pre-populated with parsed Slate nodes. The parser (in the apis repo at `common/markdown.ts`) converts standard markdown into the exact Slate node shapes listed above. When editing such a post in the editor, the content renders natively with full formatting. Supported: headings, bold, italic, inline code, block quotes, bulleted/numbered lists, images, and links.

---

## API Integration

### HTTP Client

Client-side API calls are in `nextjs-slate/common/http.ts`. Server-side calls are in `nextjs-slate/common/server.ts`.

### Key Endpoints Used

| Action | Method | Endpoint |
|---|---|---|
| Authenticate | POST | `/api/users/authenticate` |
| Get viewer | PUT | `/api/users/viewer` |
| Set username | POST | `/api/users/update-viewer-username` |
| Create post | POST | `/api/posts/create` |
| Update post | POST | `/api/posts/update` |
| Delete post | POST | `/api/posts/delete` |
| List posts | POST | `/api/posts` |
| Get post by ID | GET | `/api/posts/[id]` |
| Get public post | GET | `/api/posts/public/[slug]` |

### Authentication

- Cookie-based sessions using `nextslate` cookie (configurable via `Constants.COOKIE_NAME`)
- OAuth support: Google, Apple
- Email/password authentication
- Session key stored as API key in cookie
- Server-side auth via `Server.setup()` reading Next.js headers

---

## Post Lifecycle

1. **Create** — `HTTP.createPost({ key })` → `POST /api/posts/create` with `type: Constants.POST_TYPE`, `fields: { public: false }`
2. **Edit** — User edits title, description, content in Slate editor at `/[username]/-/[id]`
3. **Save** — `HTTP.updatePost()` → `POST /api/posts/update` with `{ id, updates: { slug, data } }`
4. **Publish** — Toggle `data.public` to `true` via update. Slug is required for public URL.
5. **View** — Public at `/[username]/[slug]`
6. **Delete** — `HTTP.deletePost()` → `POST /api/posts/delete`

Slug is auto-generated from title via `Utilities.createSlug()` on the client.

---

## User Tiers

Defined in `nextjs-slate/common/constants.ts`:

| Level | Tier |
|---|---|
| 0 | UNVERIFIED |
| 10 | VERIFIED |
| 20 | PAYING |
| 30 | GENERAL_CO_WORKING |
| 40 | PARTNER |
| 100 | ADMIN |

Users must be VERIFIED (10+) to create posts. Username must be set before publishing.

---

## Environment Variables

Required for OAuth decryption:

- `API_AES_KEY` — AES encryption key
- `API_IV_KEY` — Initialization vector key

---

## Code Formatting

Prettier configuration (`.prettierrc`):

- Print width: 9999 (no line wrapping)
- 2-space indent, no tabs
- Single quotes, semicolons
- Trailing commas: ES5
- Arrow parens: always

---

## Development Commands

```sh
npm install          # Install dependencies
npm run dev          # Dev server on port 10000
npm run build        # Production build
npm start            # Production server on port 10000
npm run script <name> # Run scripts/<name>.js with Node
```

---

## Verification

There is no test suite. Use these checks:

```sh
npx tsc --noEmit --incremental false   # Type check
npm run build                          # Production build, including the same tsc type check
npm audit                              # Dependency vulnerabilities
```

`next build`, `next dev`, and `next typegen` regenerate the tracked `next-env.d.ts`. Do not commit that churn. `Editable` handlers run in read-only mode, so optional handler props in `Post.tsx` must tolerate being undefined.

---

## Key Rules

1. **No relative imports** — Always use path aliases (`@nextjs-slate/`, `@root/`, `@pages/`)
2. **App Router for pages** — Only exception is `pages/oauth.tsx` for OAuth callback
3. **No external state management** — React state + props only
4. **CSS Modules for all styling** — No CSS-in-JS, no Tailwind
5. **No new dependencies** without explicit approval
6. **Client/server split** — Mark interactive components with `'use client'`, keep data fetching in server components
7. **Slate for editing** — All rich text uses Slate.js, no contentEditable or textarea for post content
8. **Post type** — All posts created by this app use type `Constants.POST_TYPE` (currently `NEXT_SLATE`)
9. **Privacy model** — Posts are private by default. Set `data.public: true` to publish.
