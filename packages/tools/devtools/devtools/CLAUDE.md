# @fluidframework/devtools

Developer tools API for integrating Fluid Framework debugging into applications. Provides runtime introspection of containers, DDSes, audiences, and telemetry.

## Architecture

### Source Layout

- `src/index.ts` — Public API surface (6KB): `FluidDevtools` class and registration utilities

### Related Packages

The devtools solution spans multiple packages:
- **`@fluidframework/devtools`** (this package) — Higher-level API that developers integrate into their apps
- **`@fluidframework/devtools-core`** (`packages/tools/devtools/devtools-core/`) — Lower-level API and message contracts
- **`@fluidframework/devtools-browser-extension`** (`packages/tools/devtools/devtools-browser-extension/`) — Chromium browser extension (Edge, Chrome) for visual debugging
- **`@fluidframework/devtools-view`** (`packages/tools/devtools/devtools-view/`) — React-based UI components for the extension

### Consumer Pattern

```typescript
import { initializeDevtools } from "@fluidframework/devtools";

// After creating a container:
const devtools = initializeDevtools({
  initialContainers: [{ container, containerKey: "my-container" }],
});

// Later, register additional containers:
devtools.registerContainerDevtools({ container: anotherContainer, containerKey: "another" });

// Clean up:
devtools.dispose();
```

Then install the browser extension to visualize container state, DDS data, audience, and ops.

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run test               # Tests
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Export Tiers

| Path | Content |
|------|---------|
| `.` | Public (`initializeDevtools`, `FluidDevtools`) |
| `./alpha` | Alpha APIs |
| `./beta` | Beta APIs |
| `./internal` | Full internal API |

## Development Notes

- This package is the **consumer-facing entry point** — keep the API surface simple
- The browser extension communicates with the devtools instance via `window.postMessage`
- `devtools-core` contains the actual message contracts and data processing logic
- Container registration can happen at any point in the app lifecycle
- Always call `dispose()` when done to clean up event listeners
