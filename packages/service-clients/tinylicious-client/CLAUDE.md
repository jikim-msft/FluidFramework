# @fluidframework/tinylicious-client

Service client for connecting to **Tinylicious** — a lightweight, in-memory Fluid service for local development and testing.

## Architecture

### Source Layout

- `src/TinyliciousClient.ts` — `TinyliciousClient` class: creates and loads containers against local Tinylicious (6KB)
- `src/TinyliciousAudience.ts` — Audience tracking for Tinylicious sessions
- `src/interfaces.ts` — Public types (`TinyliciousClientProps`, `TinyliciousConnectionConfig`, `TinyliciousMember`)

### Consumer Pattern

```typescript
import { TinyliciousClient } from "@fluidframework/tinylicious-client";

const client = new TinyliciousClient();  // defaults to localhost:7070
const { container } = await client.createContainer(schema, "2");
```

### Running Tinylicious

```bash
npx tinylicious  # starts on port 7070
```

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run build:esnext       # TypeScript ESM compilation
npm run test               # Mocha tests
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Export Tiers

| Path | Content |
|------|---------|
| `.` | Public (`TinyliciousClient`) |
| `./beta` | Beta APIs |
| `./internal` | Full internal API |

## Development Notes

- Tinylicious is **not for production** — it's in-memory and single-node
- Default endpoint is `http://localhost:7070`
- No authentication required — uses `InsecureTokenProvider` internally
- Useful for rapid prototyping and running examples without Azure setup
- Mirrors the same `ContainerSchema` API as `AzureClient` for easy migration to production
