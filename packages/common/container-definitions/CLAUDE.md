# @fluidframework/container-definitions

Interface definitions for Fluid containers and loaders. This is a **definitions-only** package — no runtime implementation.

## Architecture

### Source Layout

- `src/loader.ts` — `ILoader`, `ILoaderOptions`, `ICodeDetailsLoader` interfaces (25KB)
- `src/runtime.ts` — `IContainerContext`, `IRuntime`, `IRuntimeFactory` interfaces (16KB)
- `src/deltas.ts` — `IDeltaManager`, `IDeltaSender` interfaces for op processing
- `src/audience.ts` — `IAudience`, `IAudienceOwner` interfaces for connected client tracking
- `src/fluidPackage.ts` — Package format definitions (`IFluidPackage`, `IFluidCodeDetails`)
- `src/error.ts` — Container error types (`ICriticalContainerError`)
- `src/browserPackage.ts` — Browser-specific package utilities
- `src/fluidModule.ts` — Module loading interfaces

### Key Types for Consumers

- `AttachState` — Container attachment state enum (`Detached`, `Attaching`, `Attached`)
- `ICriticalContainerError` — Error type for container failures
- `IFluidCodeDetails` — Code details for container loading

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run test               # Mocha tests
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Development Notes

- Depends on `core-interfaces` and `driver-definitions` only
- Most consumer-relevant types from this package are re-exported via `fluid-framework`
- Advanced consumers building custom loaders or runtimes import from this package directly
- Changes to interfaces here require updates to all implementing packages (`container-loader`, `container-runtime`)
- Type validation is enabled — interface changes must be backward compatible
