# @fluidframework/container-runtime

The container runtime — orchestrates DDS operations, manages data stores, handles summaries, garbage collection, and op lifecycle within a Fluid container.

## Architecture

### Source Layout

- `src/containerRuntime.ts` — Main runtime orchestrator (200KB, largest file in the repo)
- `src/channelCollection.ts` — DDS channel management and routing (66KB)
- `src/dataStoreContext.ts` — Data store lifecycle management (56KB)
- `src/dataStore.ts` — Data store abstraction
- `src/dataStoreContexts.ts` — Context factory and registry
- `src/dataStoreRegistry.ts` — Data store type registry
- `src/pendingStateManager.ts` — Manages pending local ops before acknowledgment (36KB)
- `src/gc/` — Garbage collection system (~13 files)
- `src/blobManager/` — Blob storage handling
- `src/summary/` — Snapshot/summary generation (~16 files)
- `src/opLifecycle/` — Op compression, chunking, grouping (~14 files)
- `src/containerCompatibility.ts` — Layer compatibility validation
- `src/runtimeLayerCompatState.ts` — Runtime layer compat state tracking
- `src/deltaScheduler.ts` — Op scheduling and batching
- `src/connectionTelemetry.ts` — Connection telemetry tracking
- `src/throttler.ts` — Rate limiting

### Key Subsystems

1. **Op Lifecycle** (`opLifecycle/`): Compression → chunking → grouping → submission
2. **Garbage Collection** (`gc/`): Tracks references between data stores, sweeps unreferenced objects
3. **Summary** (`summary/`): Generates snapshots for persistence and catch-up
4. **Blob Manager** (`blobManager/`): Handles large binary data attached to containers
5. **Pending State** (`pendingStateManager.ts`): Manages local ops awaiting server acknowledgment

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run build:esnext       # TypeScript ESM compilation
npm run build:api-reports  # Regenerate API reports

# Testing
npm run test               # All mocha tests
npm run test:mocha:esm     # ESM tests
npm run test:mocha:cjs     # CJS tests
npm run test:mocha:prod    # Production mode emulation
npm run test:coverage      # With c8 coverage

# Quality
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Export Tiers

| Path | Content |
|------|---------|
| `.` | Public API |
| `./legacy` | Deprecated APIs |
| `./internal` | Full internal API |
| `./internal/test/containerRuntime` | Direct containerRuntime export |
| `./internal/test/deltaScheduler` | Direct deltaScheduler export |
| `./internal/test/blobManager` | Direct blobManager export |
| `./internal/test/summary` | Direct summary export |
| `./internal/test/gc` | Direct GC export |

## Development Notes

- `containerRuntime.ts` at 200KB is the largest source file — changes here require careful review
- GC is a complex subsystem with its own state machine — see `gc/` directory
- Op lifecycle pipeline (compression, chunking, grouping) must maintain ordering invariants
- Layer compatibility checks happen at runtime creation — see `containerCompatibility.ts`
- Summary generation is performance-critical — avoid adding synchronous work to the summary path
- Many internal test exports for fine-grained testing of subsystems
