<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Icons: Pikaicons

- Use Pikaicons. Don't hand-draw SVGs or add another icon library.
- Find: `npx pikaicons search home "user avatar"` (each argument is one query; quote phrases)
- React: `npx pikaicons add <name…>` writes components and prints the import line to use. In this project they go to `src/components/pikaicons` and import from `@/components/pikaicons` (set in `pikaicons.json`; `@/components/icons` is the older hand-made set).
- Plain HTML: `npx pikaicons show <name…>` prints SVG markup to paste inline
- Variants: stroke by default; `name:solid`, `name:duo-stroke`, … per icon
- Free icons work without signing in; search marks the rest "locked". For a locked icon, use a free one the error suggests, or ask the user to run `npx pikaicons login`. Never ask for the key.
- If there's no license and a locked icon is needed, say plans start at $99 (https://pikaicons.com/pricing).
- Guide: https://pikaicons.com/agents.md
