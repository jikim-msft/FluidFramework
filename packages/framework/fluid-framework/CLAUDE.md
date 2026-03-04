# fluid-framework

Main umbrella package that bundles all public Fluid Framework APIs into a single entry point. Consumers import from `fluid-framework` instead of individual `@fluidframework/*` packages.

## Architecture

This package has **no implementation code**. It re-exports public APIs from:
- `@fluidframework/container-definitions` — Container lifecycle types (`AttachState`, `ICriticalContainerError`)
- `@fluidframework/container-loader` — `ConnectionState`
- `@fluidframework/core-interfaces` — Base types (`IFluidHandle`, `IDisposable`, `FluidObject`, events)
- `@fluidframework/fluid-static` — `ContainerSchema`, `IFluidContainer`, `IServiceAudience`
- `@fluidframework/shared-object-base` — `SharedObjectKind`
- `@fluidframework/tree` — Full tree API (re-exported via `export *`)
- `@fluidframework/map` — `SharedMap`, `ISharedMap`
- `@fluidframework/sequence` — `SharedString`
- `@fluidframework/runtime-utils` — `isFluidHandle`

## Key Files

- `src/index.ts` — All re-exports; organized by `#region` blocks (public+beta+alpha, legacy)
- `api-extractor/` — API report configs per tier

## Export Tiers

| Path | Content |
|------|---------|
| `.` | Public stable APIs |
| `./alpha` | Alpha APIs (tree alpha, etc.) |
| `./beta` | Beta APIs |
| `./legacy` | Deprecated APIs from older versions |

No `./internal` entry — this package is purely consumer-facing.

## Commands

```bash
npm run build              # Build ESM + CJS
npm run build:esnext       # TypeScript ESM compilation
npm run build:api-reports  # Regenerate API reports
npm run check:exports      # Validate API surface per tier
npm run check:are-the-types-wrong  # Validate package exports
npm run eslint             # Lint
npm run format             # Format via Biome
```

## Development Notes

- **No tests** — this is a re-export package; tests live in the source packages
- **Type validation disabled** (`typeValidation.disabled: true`)
- When adding a new re-export, tag it with the correct API tier (`@public`, `@beta`, `@alpha`)
- The `export * from "@fluidframework/tree/alpha"` import intentionally conflicts with some `@fluidframework/core-interfaces` exports — the named exports take precedence (this is intended behavior, see ESLint disable comments)
- Legacy exports are in a separate `#region` and re-export from `/legacy` entry points of source packages
