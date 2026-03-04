# @fluidframework/presence

Lightweight session-scoped data sharing for real-time presence, cursors, and notifications. Data is ephemeral — it exists only while clients are connected.

## Architecture

### Source Layout

- `src/presence.ts` — Core `Presence` abstraction (7KB)
- `src/presenceManager.ts` — Manages presence lifecycle and workspaces (9KB)
- `src/presenceDatastoreManager.ts` — Datastore management for presence state (34KB)
- `src/presenceStates.ts` — State management and synchronization (17KB)
- `src/systemWorkspace.ts` — System-level workspace for internal presence (13KB)
- `src/getPresence.ts` — Helper to get Presence from a container (6KB)
- `src/latestValueManager.ts` — `Latest` state: track each client's latest value (6KB)
- `src/latestMapValueManager.ts` — `LatestMap` state: per-client key-value maps (13KB)
- `src/notificationsManager.ts` — `NotificationsManager`: fire-and-forget notifications (6KB)
- `src/latestTypes.ts` — Types for Latest state
- `src/latestMapTypes.ts` — Types for LatestMap state
- `src/notificationsManagerTypes.ts` — Types for notifications
- `src/latestValueTypes.ts` — Shared value types
- `src/broadcastControls.ts` — Rate limiting and broadcast settings
- `src/stateDatastore.ts` — State storage
- `src/stateFactory.ts` — State factory
- `src/protocol.ts` — Wire protocol for presence signals
- `src/timerManager.ts` — Timer management
- `src/types.ts` — Core type definitions
- `src/validatableTypes.ts` — Runtime type validation
- `src/validatedGetter.ts` — Validated property access
- `src/internalUtils.ts` — Internal utilities
- `src/exposedInternalTypes.ts` — Internal types exposed for specific consumers
- `src/exposedUtilityTypes.ts` — Utility types

### Key Concepts

- **Session-scoped**: Data disappears when all clients disconnect (not persisted)
- **Workspaces**: Logical groupings of state (e.g., "cursor-positions", "user-status")
- **Latest**: Each client has one value; remote clients see each other's latest value
- **LatestMap**: Each client has a key-value map; remote clients see each other's maps
- **NotificationsManager**: Fire-and-forget messages to other connected clients

### Consumer Pattern

```typescript
import { getPresence } from "@fluidframework/presence/beta";

const presence = getPresence(container);
const cursors = presence.getStates("cursors", { cursor: Latest({ x: 0, y: 0 }) });
cursors.props.cursor.local = { x: 100, y: 200 };
cursors.props.cursor.on("remoteUpdated", (update) => { /* render remote cursor */ });
```

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run test               # Mocha tests
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Export Tiers

| Path | Content |
|------|---------|
| `./beta` | Primary consumer API (`getPresence`, `Latest`, `LatestMap`, `NotificationsManager`) |
| `./alpha` | Alpha APIs (experimental features) |
| `./legacy/alpha` | Legacy alpha APIs |

Note: No `.` (public) entry — the primary API is at `./beta`. No `./internal` export exists for this package.

## Development Notes

- **No public stable API yet** — all consumer-facing APIs are `@beta` or `@alpha`
- Uses Fluid signals (not ops) for real-time delivery — lower latency but no persistence guarantee
- `presenceDatastoreManager.ts` (34KB) is the most complex file — handles cross-client state synchronization
- Broadcast controls allow rate-limiting updates to avoid flooding
- Changes to the wire protocol (`protocol.ts`) must maintain backward compatibility with connected clients
