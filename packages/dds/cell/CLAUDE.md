# @fluidframework/cell

SharedCell — a DDS that stores a single shared value. Primarily serves as a minimal DDS example; **SharedTree is recommended for new development**.

## Architecture

### Source Layout

- `src/cell.ts` — `SharedCell` implementation (10KB): single-value store with last-writer-wins semantics
- `src/cellFactory.ts` — Factory for creating SharedCell instances
- `src/interfaces.ts` — Public types (`ISharedCell`, events)

### Key Concepts

- Stores a single JSON-serializable value
- Uses **last-writer-wins** conflict resolution — concurrent `set()` calls result in one winner
- Emits `"valueChanged"` event when the value changes

## Commands

```bash
npm run build              # Full build (ESM + CJS)
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
| `.` | Public (`SharedCell`, `ISharedCell`) |
| `./internal` | Full internal API |

Note: No `./legacy` tier — this package has a simpler export structure.

## Development Notes

- **Recommendation**: Use `SharedTree` instead for new development — it provides richer data modeling
- Last-writer-wins means concurrent edits can silently overwrite each other
- Minimal DDS — useful as a learning reference for the DDS pattern
