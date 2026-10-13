# Budget Constellation

Budget Constellation is a hackathon finance prototype that renders fake demo spending as an explorable night sky while keeping a semantic data table as the source of truth.

## Run locally

```bash
pnpm install
pnpm dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

```bash
pnpm test
pnpm build
pnpm preview
```

## Included

- Public marketing page with a live sample sky, product explanation, accessibility demonstration, privacy promise, FAQ and calls to action.
- Local demo sign-up, login, password recovery and verification screens. Never enter real financial or bank credentials.
- Three-step onboarding with demo, CSV and manual-entry choices.
- Interactive Three.js dashboard: category clusters, transaction stars, recurring bill planets, orbits and selection.
- Semantic Sky/Table toggle, search, synchronized selection and CSV export.
- Eclipse warning, time travel, gravity savings simulation, goals and weekly insights.
- Persistent accessibility panel: Full/Reduced/None motion, four themes, 100–200% text, six demo languages and plain-language mode.
- Responsive navigation, screen-reader summary, visible focus, forced-colors fallback, pause control and static rendering under Motion None.
- Seeded fake transaction data with a guaranteed three-bill eclipse.

## Important limitations

This is a design prototype, not financial advice or a banking service. Mock authentication and all demo data are stored locally. Google, Apple, passkey, email delivery, bank connections and server sync are not connected.

## Deployment

Build `dist/` and deploy it to Deployxa as a static HTTPS site with SPA fallback to `index.html`.
