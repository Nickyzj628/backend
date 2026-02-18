# AGENTS.md

AI coding assistant guidelines for this Bun monorepo.

## Tech Stack

- **Runtime**: Bun (ESM)
- **Backend**: ElysiaJS with TypeBox validation, SQLite (`bun:sqlite`)
- **Frontend**: Preact + Vite + TailwindCSS v4, wouter-preact (routing), socket.io-client
- **Lint/Format**: Biome (shared across both apps)
- **Testing**: Bun test runner

## Project Structure

```
.
├── apps/
│   ├── backend/                    # ElysiaJS API server
│   │   ├── src/
│   │   │   ├── app.ts               # Elysia entry point
│   │   │   ├── routes/             # HTTP & WebSocket routes
│   │   │   ├── libs/               # Shared config
│   │   │   ├── types/              # TypeBox schemas
│   │   │   └── utils/              # Utility functions
│   │   ├── data/sqlite.db
│   │   └── dist/
│   └── frontend/                   # Preact SPA
│       ├── src/
│       │   ├── components/          # Reusable UI components
│       │   ├── pages/               # Route pages
│       │   ├── hooks/               # Custom hooks (store/* for state)
│       │   ├── helpers/             # Utility functions
│       │   ├── layouts/             # Page layouts
│       │   ├── etc/                 # Context, constants, etc
│       │   └── main.tsx
│       ├── vite.config.ts
│       └── index.html
├── biome.json                       # Root Biome config
└── package.json                     # Workspace root
```

## Commands

```bash
# Root workspace
bun install                          # Install all dependencies
bun run dev                          # Start both frontend & backend
bun run dev:backend                  # Start only backend (port 3000)
bun run dev:frontend                 # Start only frontend (port 5173)
bun run build                        # Build all apps
bun run check                        # Lint & format check all
bun run check:write                  # Auto-fix lint issues

# Backend-specific
bun run --cwd apps/backend dev
bun run --cwd apps/backend build
bunx biome check apps/backend/src

# Frontend-specific
bun run --cwd apps/frontend dev
bun run --cwd apps/frontend build
bunx biome check apps/frontend/src

# Testing
bun test                             # Run all tests
bun test apps/backend/src/utils/...  # Run single test file (backend)
```

## Code Style

### Biome Config (applies to both apps)
- **Indent**: Tabs
- **Quotes**: Double
- **Semicolons**: Required
- **Line endings**: LF
- Run `bunx biome check --write` to auto-fix

### Naming Conventions

| Element        | Case       | Example                     |
|----------------|------------|-----------------------------|
| Variables      | camelCase  | `userName`, `pageSize`      |
| Constants      | UPPER_SNAKE| `PORT`, `BLOGS_DIR`         |
| Functions      | camelCase  | `renderMarkdown()`          |
| Classes        | PascalCase | `RoomService`               |
| Types/Interfaces| PascalCase | `BlogItem`, `ButtonProps`   |
| Files (TS/TSX) | lowercase  | `blogs.ts`, `button.tsx`    |
| Components     | PascalCase | `Button.tsx`, `Header.tsx` |

### Imports

**Backend:**
```typescript
import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { BLOGS_DIR } from "@/libs/constants";
import { renderMarkdown } from "./markdown";
```

**Frontend:**
```typescript
import { clsx } from "@/helpers/string";
import useUser from "@/hooks/store/use-user";
import RecentAnimes from "./recent-animes";
import { getPeriod } from "@/helpers/time";
```

## Backend Patterns

### Route with Validation (ElysiaJS)
```typescript
export const blogs = new Elysia({ name: "blogs" })
  .model({ "blog.item": BlogItemSchema })
  .get("/blogs/:slug", ({ params: { slug }, set }) => {
    const blog = getBlog(slug);
    if (!blog) {
      set.status = 404;
      return "Not found";
    }
    return blog;
  }, {
    params: t.Object({ slug: t.String() }),
    response: { 200: "blog.item", 404: t.String() },
  });
```

### Service Class with Error Handling
```typescript
export type OperationResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export class RoomService {
  private roomsMap = new Map<string, Room>();

  createRoom(ws: WS, payload: CreateRoomPayload): OperationResult<CreateRoomResponse> {
    if (this.userMap.has(ws)) {
      return { success: false, error: { code: "USER_ALREADY_IN_ROOM", message: "..." } };
    }
    return { success: true, data: { roomId: generateId() } };
  }
}
```

### Database (bun:sqlite)
```typescript
import { Database } from "bun:sqlite";

const db = new Database("data/sqlite.db");
const listStmt = db.prepare("SELECT * FROM blogs LIMIT $limit OFFSET $offset");
const rows = listStmt.all({ $limit: 10, $offset: 0 });
```

## Frontend Patterns

### Component Structure
```typescript
import { clsx } from "@/helpers/string";
import { CSSProperties, ReactNode } from "preact/compat";

type Props = {
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    onClick?: () => void;
};

const Component = ({ children, className, style, onClick }: Props) => {
    return (
        <div className={clsx("base-classes", className)} style={style} onClick={onClick}>
            {children}
        </div>
    );
};

export default Component;
export type ComponentProps = Props;
```

### State Management (hooks/store/*)
```typescript
// apps/frontend/src/hooks/store/use-user.ts
import createPersistedGlobalState from "@/etc/create-persisted-global-state";

type UserState = { name: string; token?: string };

const useUser = createPersistedGlobalState<UserState>("user", { name: "Guest" });

export default useUser;
```

### Routing (wouter-preact)
```typescript
import { Route, Switch } from "wouter-preact";
import HomePage from "./pages/home";
import BlogPage from "./pages/blog";

export default function Router() {
    return (
        <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/blog/:slug" component={BlogPage} />
            <Route component={NotFound} />
        </Switch>
    );
}
```

### Icons (Iconify + Tailwind)
```tsx
<Button icon="icon-[mingcute--align-arrow-left-line]">Click me</Button>
```

## Error Handling

- **Backend**: Use `set.status` for HTTP codes, return error objects from services (don't throw)
- **Frontend**: Use `react-hot-toast` for notifications, handle API errors gracefully
- Validate all inputs with TypeBox schemas (backend) or runtime checks (frontend)

## Pre-commit Checklist

1. Run `bunx biome check .`
2. Run `bun run build` to verify
3. Ensure no secrets in code
4. Follow Conventional Commits: `feat(backend): add pagination`, `fix(frontend): resolve loading state`

## Security

- Never commit secrets or .env files
- Validate all inputs (TypeBox for backend, runtime for frontend)
- Use `ws.id` for WebSocket user identification (not IP)
- Sanitize user-generated content before rendering

## Shared Conventions

- Use `@/` alias for imports (configured in tsconfig.json)
- Prefer functional components and hooks in frontend
- Keep components small and focused
- Use TypeScript strict mode
- Write tests for utility functions and services
