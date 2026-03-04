# @fluidframework/core-interfaces

Foundational interface definitions that form the base of the entire Fluid Framework type hierarchy. This is a **definitions-only** package — no runtime implementation.

## Architecture

### Source Layout

- `src/index.ts` — Public re-exports
- `src/internal.ts` — Internal exports (utility types)
- `src/handles.ts` — `IFluidHandle` interface for referencing Fluid objects
- `src/fluidLoadable.ts` — `IFluidLoadable` interface
- `src/events.ts` — Event system types (`IEventProvider`, `IEvent`, etc.)
- `src/events/` — New event system (`Listenable`, `Listeners`, `Off`)
- `src/error.ts` — Error base types (`IErrorBase`)
- `src/erasedType.ts` — Type-erasure utilities (`ErasedType`)
- `src/brandedType.ts` — Branded type utilities
- `src/disposable.ts` — `IDisposable` interface
- `src/logger.ts` — Logger interface types
- `src/provider.ts` — `FluidObject` provider pattern
- `src/config.ts` — Configuration interfaces
- `src/messages.ts` — Message types
- `src/jsonSerializable.ts` — JSON serialization type constraints
- `src/jsonDeserialized.ts` — JSON deserialization types
- `src/jsonType.ts` — JSON type definitions
- `src/jsonString.ts` — JSON string handling
- `src/jsonUtils.ts` — JSON utility types
- `src/opaqueJson.ts` — Opaque JSON types
- `src/deepReadonly.ts` — Deep readonly type utility
- `src/shallowReadonly.ts` — Shallow readonly type utility
- `src/exposedInternalUtilityTypes.ts` — Internal utility types exposed for specific consumers (64KB)
- `src/exposedUtilityTypes.ts` — Public utility types

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run build:esnext       # TypeScript ESM compilation
npm run build:api-reports  # Regenerate API reports
npm run check:exports      # Validate API tiers

# Testing
npm run test               # Mocha tests (ESM)
npm run test:mocha:cjs     # CJS tests
npm run test:coverage      # With c8 coverage

# Quality
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Export Tiers

| Path | Content |
|------|---------|
| `.` | Public interfaces |
| `./legacy` | Deprecated interfaces |
| `./legacy/alpha` | Legacy alpha interfaces |
| `./internal` | Full internal interface set |
| `./internal/exposedUtilityTypes` | Utility types for specific consumers |

## Development Notes

- This is a **leaf package** — no Fluid Framework dependencies (only dev dependencies)
- Every other Fluid package depends on this, so changes here have the widest blast radius
- Has a special test variant: `test:esm:no-exactOptionalPropertyTypes` to verify types work without `exactOptionalPropertyTypes`
- Type validation is enabled (`typeValidation.entrypoint: "legacy"`) — type changes must be backward compatible
- `exposedInternalUtilityTypes.ts` (64KB) contains complex conditional types — handle with care
- The event system has two APIs: legacy (`IEventProvider`) and new (`Listenable`) — new code should use `Listenable`
