# @fluidframework/tree

SharedTree — the primary DDS for hierarchical, schema-driven collaborative data. This is the largest and most complex DDS in the framework.

## Architecture

### Source Layout

- `src/shared-tree/` — Core SharedTree implementation
- `src/shared-tree-core/` — Low-level tree operations and change management
- `src/simple-tree/` — Simplified API layer for consumers
- `src/feature-libraries/` — Advanced features (~30 subdirectories: chunked-forest, flex-tree, node-key, schema-index, etc.)
- `src/codec/` — Serialization codecs for tree data
- `src/core/` — Core data model types and utilities
- `src/tableSchema.ts` — Table schema definitions (75KB)
- `src/api.ts` — Public API surface

### Collaboration Pipeline

User edits → SharedTree API → Change intents → Op submission → Merge/rebase → Committed state

### Key Concepts

- **Schema**: Tree nodes are typed via schemas (`SchemaFactory`)
- **Views**: Read/write access to tree data through typed proxies
- **Branches**: Transactional editing with fork/merge support
- **Undo/Redo**: Built-in revertible operations
- **Constraints**: Schema validation at edit time

## Export Tiers

| Path | Content |
|------|---------|
| `.` | Public stable API |
| `./beta` | Beta features |
| `./alpha` | Alpha features (experimental) |
| `./legacy` | Deprecated APIs |
| `./internal` | Framework-internal APIs |
| `./internal/test` | Test exports (requires `allow-ff-test-exports` condition) |

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run build:esnext       # TypeScript ESM compilation
npm run tsc                # CJS compilation
npm run build:api-reports  # Regenerate API reports
npm run check:exports      # Validate all API tiers

# Testing
npm run test               # All mocha tests (ESM + CJS smoke + prod smoke)
npm run test:mocha:esm     # ESM tests
npm run test:mocha:cjs     # CJS tests
npm run test:mocha:prod    # Production mode emulation
npm run test:coverage      # With c8 coverage
npm run test:snapshots:regen  # Regenerate serialization snapshots

# Benchmarks
npm run bench              # Performance benchmarks
npm run bench:profile      # V8 profiling
npm run test:memory        # Memory profiling

# Dependency analysis
npm run depcruise           # Check import graph
npm run depcruise:regen-known-issues  # Update baseline

# Quality
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Testing

Tests are in `src/test/` with ~48 subdirectories covering:
- Unit tests for each feature library
- Fuzz/stress tests (configurable iteration count via `FUZZ_TEST_COUNT`)
- Memory profiling (`src/test/memory/`)
- Serialization snapshot compatibility tests (`domain-schema-compatibility-snapshots/`)
- Custom benchmarks (`.mocharc.customBenchmarks.cjs`)

### Test Variants

- `test:mocha:esm` — Full ESM test suite
- `test:mocha:cjs -- --fgrep @Smoke` — CJS smoke tests only (to avoid overhead)
- `test:mocha:prod -- --fgrep @Smoke` — Production-mode smoke tests

## Development Notes

- Snapshot tests enforce serialization compatibility — do NOT regenerate without understanding backward compatibility implications
- The `@Smoke` tag marks tests that run in CJS/prod variants; other tests only run in ESM
- `depcruise` checks for internal import cycle issues separate from the repo-wide `layer-check`
- This package has test exports gated by `allow-ff-test-exports` condition — not accessible in normal consumer builds
