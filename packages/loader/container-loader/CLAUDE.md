# @fluidframework/container-loader

Core container loading and lifecycle management. Handles connecting to Fluid services, loading containers, and managing the connection lifecycle.

## Architecture

### Source Layout

- `src/container.ts` — Main `Container` class (91KB) — the primary Fluid container abstraction
- `src/loader.ts` — `Loader` class for creating and loading containers
- `src/connectionManager.ts` — WebSocket connection management (41KB)
- `src/connectionStateHandler.ts` — Connection state machine (31KB)
- `src/deltaManager.ts` — Op (delta) processing and ordering (47KB)
- `src/deltaQueue.ts` — Queue for incoming/outgoing ops
- `src/containerContext.ts` — Context passed to runtime
- `src/containerStorageAdapter.ts` — Storage service abstraction
- `src/serializedStateManager.ts` — Serialized container state for offline scenarios (22KB)
- `src/snapshotRefresher.ts` — Snapshot refresh logic
- `src/createAndLoadContainerUtils.ts` — Utilities for container creation/loading
- `src/protocol/` — Protocol handling (quorum, protocol state)
- `src/protocol.ts` — Protocol handler
- `src/location-redirection-utilities/` — URL redirection handling
- `src/contracts.ts` — Internal contracts and interfaces
- `src/attachment.ts` — Container attachment logic
- `src/audience.ts` — Audience tracking (who's connected)
- `src/loaderLayerCompatState.ts` — Loader layer compatibility state
- `src/loadPaused.ts` — Paused loading state management

### Connection Lifecycle

```
Disconnected → Connecting → CatchingUp → Connected
                    ↓                        ↓
              Disconnected ←──────── Disconnected
```

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run build:esnext       # TypeScript ESM compilation
npm run build:api-reports  # Regenerate API reports

# Testing
npm run test               # All mocha tests
npm run test:mocha:esm     # ESM tests
npm run test:mocha:cjs     # CJS tests
npm run test:coverage      # With c8 coverage

# Quality
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Export Tiers

| Path | Content |
|------|---------|
| `.` | Public (`Loader`, `ConnectionState`) |
| `./legacy` | Deprecated APIs |
| `./legacy/alpha` | Legacy alpha APIs |
| `./internal` | Full internal API |
| `./internal/test/container` | Direct Container export |
| `./internal/test/contracts` | Direct contracts export |
| `./internal/test/connectionManager` | Direct connectionManager export |
| `./internal/test/deltaManager` | Direct deltaManager export |
| `./internal/test/utils` | Direct utils export |

## Development Notes

- `container.ts` (91KB) and `deltaManager.ts` (47KB) are large — review changes carefully
- Connection state transitions are critical — changes to `connectionStateHandler.ts` affect all consumers
- Layer compatibility is validated at the Loader↔Driver and Loader↔Runtime boundaries
- Serialized state manager handles offline/stashed container scenarios — test with and without network
- Many internal test exports allow fine-grained testing of connection manager, delta manager, etc.
