# @fluidframework/fluid-static

Simplified API for consuming Fluid containers without writing custom container code. This is the primary entry point for application developers.

## Architecture

### Source Layout

- `src/fluidContainer.ts` — `FluidContainer` class wrapping Fluid container lifecycle (14KB)
- `src/rootDataObject.ts` — Root data object managing container schema (10KB)
- `src/treeRootDataObject.ts` — Tree-based root data object (8KB)
- `src/serviceAudience.ts` — Audience tracking abstraction (5KB)
- `src/types.ts` — Public types (`ContainerSchema`, `IFluidContainer`, `IServiceAudience`, etc., 9KB)
- `src/utils.ts` — Container utilities (5KB)
- `src/compatibilityConfiguration.ts` — Compatibility mode configuration
- `src/index.ts` — Public re-exports

### Key Concepts

- **ContainerSchema**: Declares the shape of a container (which DDSes and data objects)
- **FluidContainer**: High-level wrapper that manages create/load/attach lifecycle
- **InitialObjects**: Pre-created DDS instances available immediately after container load
- **ServiceAudience**: Tracks connected users (members) in the container

### Consumer Pattern

```typescript
const schema: ContainerSchema = {
  initialObjects: { myMap: SharedMap, myTree: SharedTree },
};
const container = await client.createContainer(schema);
const { myMap, myTree } = container.initialObjects;
```

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run build:esnext       # TypeScript ESM compilation
npm run build:api-reports  # Regenerate API reports

# Testing
npm run test               # Mocha tests
npm run test:mocha:esm     # ESM tests
npm run test:mocha:cjs     # CJS tests
npm run test:coverage      # With c8 coverage

# Quality
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Development Notes

- This is the consumer-facing API — prioritize simplicity and discoverability
- `rootDataObject.ts` creates and manages DDSes declared in `ContainerSchema`
- `treeRootDataObject.ts` is the newer variant using SharedTree as the root
- Changes to `types.ts` affect the public API surface — update API reports
- Compatibility configuration handles cross-version container loading scenarios
