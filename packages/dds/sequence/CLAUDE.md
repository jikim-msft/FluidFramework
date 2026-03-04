# @fluidframework/sequence

SharedString — a distributed sequence DDS for collaborative text editing and ordered collections.

## Architecture

### Source Layout

- `src/sequence.ts` — Core `SharedSegmentSequence` base class (37KB)
- `src/sharedString.ts` — `SharedString` implementation (text with markers and annotations)
- `src/sharedSequence.ts` — Generic typed sequence
- `src/sequenceFactory.ts` — Factory for creating sequences
- `src/sequenceDeltaEvent.ts` — Delta event types for change notification
- `src/intervalCollection.ts` — Interval tracking for ranges/selections (57KB)
- `src/intervalCollectionMap.ts` — Map of named interval collections
- `src/intervalCollectionMapInterfaces.ts` — Interval collection type definitions
- `src/IntervalCollectionValues.ts` — Interval value handling
- `src/intervalIndex/` — Interval indexing data structures
- `src/intervals/` — Interval types and utilities
- `src/intervalTree.ts` — Interval tree implementation
- `src/revertibles.ts` — Undo/redo support for sequence operations (21KB)

### Key Concepts

- Built on `@fluidframework/merge-tree` for conflict-free concurrent text editing
- **Segments**: Atomic units of text that can be split/merged during concurrent edits
- **Markers**: Non-text elements in the sequence (e.g., paragraph breaks)
- **Interval Collections**: Track ranges that automatically adjust as text changes (e.g., selections, comments)
- **Revertibles**: Undo/redo that correctly handles concurrent operations

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
npm run test:stress        # Stress/fuzz tests

# Quality
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Export Tiers

| Path | Content |
|------|---------|
| `.` | Public (`SharedString`) |
| `./legacy` | Deprecated APIs |
| `./internal` | Full internal API |
| `./internal/test/intervalCollection` | Direct interval collection export |
| `./internal/test` | Test exports |

## Development Notes

- Depends on `@fluidframework/merge-tree` — the CRDT engine for text sequences
- `intervalCollection.ts` is the most complex file (57KB) — handles interval tracking, adjustment, and conflict resolution
- Stress tests use configurable `FUZZ_TEST_COUNT` for fuzzing concurrent operations
- `revertibles.ts` provides undo/redo that is aware of merge-tree's conflict resolution
- Changes to segment handling can affect backward compatibility — test with snapshot fixtures
