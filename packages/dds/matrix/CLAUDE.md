# @fluidframework/matrix

SharedMatrix — a distributed 2D rectangular array for collaborative grid/spreadsheet-like data.

## Architecture

### Source Layout

- `src/matrix.ts` — `SharedMatrix` implementation (41KB): core 2D array operations
- `src/permutationvector.ts` — Row/column permutation tracking for insert/remove operations (15KB)
- `src/sparsearray2d.ts` — Sparse 2D array storage backing the matrix (8KB)
- `src/undoprovider.ts` — Undo/redo support for matrix operations (6KB)
- `src/handlecache.ts` — Handle caching for cell values (5KB)
- `src/handletable.ts` — Handle table mapping
- `src/ops.ts` — Op definitions for matrix operations
- `src/serialization.ts` — Matrix serialization/deserialization
- `src/runtime.ts` — Runtime utilities
- `src/range.ts` — Range utilities
- `src/types.ts` — Type definitions

### Key Concepts

- 2D array with row and column operations: `insertRows`, `removeRows`, `insertCols`, `removeCols`
- Cell access via `getCell(row, col)` and `setCell(row, col, value)`
- Concurrent row/column insertions and removals are handled via merge-tree-based permutation vectors
- Built-in undo/redo support via `UndoRedoStackManager`

### Consumer Pattern

```typescript
import { SharedMatrix } from "@fluidframework/matrix";

const schema = { initialObjects: { grid: SharedMatrix } };
const { grid } = container.initialObjects;
grid.insertRows(0, 3);
grid.insertCols(0, 4);
grid.setCell(0, 0, "Hello");
```

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run test               # Mocha tests (extensive test suite)
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Export Tiers

| Path | Content |
|------|---------|
| `.` | Public (`SharedMatrix`) |
| `./legacy` | Deprecated APIs |
| `./internal` | Full internal API |
| `./internal/test` | Test exports (requires `allow-ff-test-exports` condition) |

## Development Notes

- The permutation vector (`permutationvector.ts`) is the most complex part — tracks logical-to-physical row/column mapping
- Sparse 2D array means empty cells don't consume memory
- Row/column operations create merge-tree segments for conflict resolution
- Undo provider tracks operations for reversible editing
- Test suite is large (~22 test files) covering concurrent editing scenarios
