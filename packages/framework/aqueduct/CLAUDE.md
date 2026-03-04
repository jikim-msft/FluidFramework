# @fluidframework/aqueduct

Base layer for building custom Fluid data objects. Provides `DataObject` and `PureDataObject` base classes and container runtime factories.

## Architecture

### Source Layout

- `src/data-objects/` — Base data object classes
  - `DataObject` — Full-featured base class with root `SharedDirectory` and blob storage
  - `PureDataObject` — Lightweight base without built-in DDS (bring your own)
- `src/data-object-factories/` — Factories for creating data objects
  - `DataObjectFactory` — Creates `DataObject` instances with registration support
  - `PureDataObjectFactory` — Creates `PureDataObject` instances
- `src/container-runtime-factories/` — Container runtime setup
  - `ContainerRuntimeFactoryWithDefaultDataStore` — Factory that bootstraps a container with a default data store

### Key Concepts

- `DataObject` extends `PureDataObject` and adds a root `SharedDirectory` for convenient key-value state
- `DataObjectFactory` handles registration, initial state setup, and DDS creation
- The container runtime factory is the entry point that defines what data objects a container supports
- This is the **advanced** API — most consumers should use `fluid-framework` + `ContainerSchema` instead

### Consumer Pattern (advanced)

```typescript
import { DataObject, DataObjectFactory } from "@fluidframework/aqueduct";

class MyDataObject extends DataObject {
  protected async initializingFirstTime() {
    this.root.set("count", 0);
  }
  get count() { return this.root.get("count"); }
}

const factory = new DataObjectFactory("my-data-object", MyDataObject, [], {});
```

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run test               # Mocha tests
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Development Notes

- Most third-party consumers don't need this — `ContainerSchema` from `fluid-framework` is simpler
- `DataObject.root` is a `SharedDirectory` (from `@fluidframework/map`) — legacy API
- Changes here affect the `fluid-framework` umbrella's re-exports
- `initializingFirstTime()` runs only on container creation; `hasInitialized()` runs on every load
