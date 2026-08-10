# AGENTS.md

Guidance for AI coding agents working in the **Windmill-EVM-WebUI** repository.

## Project overview

Windmill Exchange is a Next.js (App Router) web interface for the Windmill auction-based matching protocol. The UI talks to the protocol's smart contracts through Web3 wallets and displays live protocol stats indexed by a subgraph.

## Repository layout

- `app/` — Next.js App Router pages. Add new routes here. `layout.tsx` holds global metadata and providers.
- `components/layout/` — `Navbar.tsx` and `Footer.tsx`. The navbar uses components from `components/ui/resizable-navbar`.
- `components/landing/` — landing page sections.
- `context/WalletContext.tsx` — Web3 wallet state (Wagmi).
- `lib/`, `hooks/`, `types/` — utilities, hooks, TypeScript types.
- `public/` — static assets; `windmill-logo*.svg` and `stability.svg` are brand logos.
- `brand/` — branding spec (logo, palette, typography). Keep in sync with `public/` logos.

## Development workflow

```bash
npm install        # install dependencies
npm run dev        # start dev server (http://localhost:3000)
npm run build      # production build
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript type-check
```

### Quality gates (run before finishing any change)

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The CI workflow (`.github/workflows/ci.yml`) runs lint + build on every PR against `main`.

## Conventions

- TypeScript strict typing; avoid `any`.
- Tailwind utility classes only; design tokens live in `app/globals.css`.
- Functional components with hooks; follow existing patterns in `components/`.
- Do not add `console.log` statements.
- Do not commit secrets, wallet keys, or `.env` contents.
- Keep documentation TODO-free and links valid.

## Branding change checklist

When touching brand assets or copy:

1. Update files in `public/` and keep `brand/Brand.md` in sync.
2. Verify logo renders in the navbar, footer, and faicon (`app/icon.svg`).
3. Confirm open-graph metadata in `app/layout.tsx` reflects the current brand.

## Communication

All project communication happens on Discord (`#windmill-exchange`). GitHub is for code only. Mention AI usage in PR descriptions when applicable.