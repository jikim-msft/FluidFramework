# @fluidframework/map

SharedMap — a distributed key-value data structure for real-time collaboration.

## Architecture

### Source Layout

- `src/map.ts` — SharedMap implementation (DDS surface)
- `src/mapKernel.ts` — Core map operations (set, get, delete, iteration, conflict resolution)
- `src/mapFactory.ts` — Factory for creating SharedMap instances
- `src/directory.ts` — SharedDirectory implementation (hierarchical key-value with subdirectories, 91KB)
- `src/directoryFactory.ts` — Factory for SharedDirectory
- `src/interfaces.ts` — Public type definitions (`ISharedMap`, `IDirectory`, etc.)
- `src/internalInterfaces.ts` — Internal-only types
- `src/localValues.ts` — Local value handling for serialization
- `src/utils.ts` — Shared utilities

### Key Types

- `SharedMap` — Flat key-value store (`string → serializable value`)
- `SharedDirectory` — Hierarchical map with `/` separated paths and subdirectories

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run build:esnext       # TypeScript ESM compilation
npm run build:api-reports  # Regenerate API reports
npm run check:exports      # Validate API tiers

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
| `.` | Public (`SharedMap`, `ISharedMap`) |
| `./legacy` | Deprecated APIs (`SharedDirectory`, `ISharedDirectory`) |
| `./internal` | Full internal API |
| `./internal/test` | Test exports |

## Development Notes

- `SharedDirectory` is in the **legacy** tier — new code should use `SharedMap` or `SharedTree`
- `directory.ts` is the largest file (91KB) — most complexity is in subdirectory traversal and op handling
- `mapKernel.ts` handles conflict resolution for concurrent edits (last-writer-wins per key)
- Tests include memory benchmarks in `src/test/`
