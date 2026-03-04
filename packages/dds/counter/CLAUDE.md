# @fluidframework/counter

SharedCounter — a distributed integer counter DDS that uses delta operations to avoid conflicts during concurrent edits.

## Architecture

### Source Layout

- `src/counter.ts` — `SharedCounter` implementation (7KB): increment/decrement with delta-based conflict resolution
- `src/counterFactory.ts` — Factory for creating SharedCounter instances
- `src/interfaces.ts` — Public types (`ISharedCounter`, events)

### Key Concepts

- Unlike a shared value, the counter uses **delta operations** (increment by N) rather than set operations
- Concurrent increments from multiple clients are additive — no conflicts or overwrites
- Emits `"incremented"` event with the delta value and new total

### Consumer Pattern

```typescript
import { SharedCounter } from "@fluidframework/counter";

const schema = { initialObjects: { clicks: SharedCounter } };
const { clicks } = container.initialObjects;
clicks.increment(1);
clicks.on("incremented", (delta, newValue) => { /* update UI */ });
```

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run build:api-reports  # Regenerate API reports
npm run check:exports      # Validate API tiers

# Testing
npm run test               # Mocha tests

# Quality
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Export Tiers

| Path | Content |
|------|---------|
| `.` | Public (`SharedCounter`, `ISharedCounter`) |
| `./legacy` | Deprecated APIs |
| `./internal` | Full internal API |
| `./internal/test` | Test exports (requires `allow-ff-test-exports` condition) |

## Development Notes

- Small, focused DDS — good reference for understanding the DDS pattern
- Delta-based ops mean this DDS never has merge conflicts
- Re-exported through the `fluid-framework` umbrella package
