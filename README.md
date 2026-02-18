# Nickyzj Monorepo

Bun workspace monorepo with ElysiaJS backend and a placeholder for frontend.

## Structure

```
.
├── apps/
│   ├── backend/          # ElysiaJS API + WebSocket
│   └── frontend/         # Frontend app (configure as needed)
├── biome.json            # Code quality config
└── package.json          # Workspace root
```

## Quick Start

```bash
# Install dependencies
bun install

# Start backend only
bun run dev:backend

# Start frontend only (when configured)
bun run dev:frontend

# Start both
bun run dev

# Build all apps
bun run build

# Run linting
bun run check
```

## Backend

See `apps/backend/` and `AGENTS.md` for detailed guidelines.

## Frontend

The `apps/frontend/` directory is ready for your framework of choice (React, Vue, Svelte, etc.). Just configure the `dev` and `build` scripts in `apps/frontend/package.json`.
