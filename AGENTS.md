# AGENTS.md

AI coding assistant guidelines for this Bun/ElysiaJS monorepo.

## Tech Stack

- **Runtime**: Bun (ESM)
- **Framework**: ElysiaJS with TypeBox validation
- **Database**: SQLite (`bun:sqlite`)
- **Lint/Format**: Biome
- **Testing**: Bun test runner

## Project Structure

```
.
├── apps/
│   ├── backend/          # ElysiaJS backend API
│   │   ├── src/
│   │   │   ├── app.ts              # Elysia entry
│   │   │   ├── routes/             # HTTP & WebSocket routes
│   │   │   ├── libs/               # Shared config
│   │   │   ├── types/              # TypeBox schemas
│   │   │   └── utils/              # Utility functions
│   │   ├── data/sqlite.db          # Database
│   │   └── dist/                   # Build output
│   └── frontend/         # Frontend app (configure as needed)
├── biome.json            # Root Biome config
└── package.json          # Workspace root
```

## Commands

```bash
# Root workspace commands
bun install                              # Install all dependencies
bun run dev                              # Start both frontend & backend
bun run dev:backend                      # Start only backend
bun run dev:frontend                     # Start only frontend
bun run build                            # Build all apps
bun run check                            # Lint & format check all
bun run check:write                      # Auto-fix all issues

# Backend-specific (run from apps/backend/ or use --cwd)
bun run --cwd apps/backend dev
bun run --cwd apps/backend build
bunx biome check apps/backend/src

# Testing
bun test                                 # Run all tests
bun test apps/backend/src/utils/...      # Run single test file
```

## Code Style

### Biome Config
- **Indent**: Tabs
- **Quotes**: Double
- **Semicolons**: Required
- **Line endings**: LF

### Imports
```typescript
import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { BLOGS_DIR } from "@/libs/constants";
import { renderMarkdown } from "./markdown";
```

### Naming Conventions

| Element | Case | Example |
|---------|------|---------|
| Variables | camelCase | `userName`, `pageSize` |
| Constants | UPPER_SNAKE | `PORT`, `BLOGS_DIR` |
| Functions | camelCase | `renderMarkdown()` |
| Classes | PascalCase | `RoomService` |
| Types | PascalCase | `BlogItem` |
| Files | lowercase | `blogs.ts` |

### Elysia Patterns

**Route with Validation:**
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

**Service Class:**
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
    return { success: true, data: { ... } };
  }
}
```

## Database

Use `bun:sqlite` with named parameters:

```typescript
import { Database } from "bun:sqlite";

const db = new Database("data/sqlite.db");
const listStmt = db.prepare("SELECT * FROM blogs LIMIT $limit OFFSET $offset");
const rows = listStmt.all({ $limit: 10, $offset: 0 });
```

## Error Handling

- Use `set.status` for HTTP status codes
- Return error objects from services, don't throw
- Use TypeBox schemas for response validation

## Pre-commit Checklist

1. Run `bunx biome check .`
2. Run `bun run build` to verify
3. Ensure no secrets in code
4. Follow Conventional Commits: `feat(backend): add pagination`

## Security

- Never commit secrets
- Validate all inputs with TypeBox schemas
- Use `ws.id` (not IP) for user identification in WebSocket
