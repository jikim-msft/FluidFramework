# @fluidframework/driver-definitions

Interface definitions for Fluid storage drivers. This is a **definitions-only** package for implementing custom service connections.

## Architecture

### Source Layout

- `src/storage.ts` — Core driver interfaces: `IDocumentService`, `IDocumentServiceFactory`, `IDocumentStorageService`, `IDocumentDeltaConnection` (17KB)
- `src/urlResolver.ts` — `IUrlResolver` interface for resolving container URLs to service endpoints
- `src/driverError.ts` — Driver error types and classification (7KB)
- `src/cacheDefinitions.ts` — Cache interface definitions
- `src/protocol/` — Protocol-level interfaces (~15 files: ops, messages, proposals, quorum, summary)
- `src/git/` — Git-like storage interfaces (blobs, trees, refs)

### Key Types for Consumers

- `IDocumentServiceFactory` — Main factory interface for creating service connections
- `IUrlResolver` — Resolves human-readable URLs to Fluid service endpoints
- `DriverErrorTypes` — Error classification for driver-level failures

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run build:esnext       # TypeScript ESM compilation
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Development Notes

- Only depends on `core-interfaces` — lowest layer of the framework
- **No tests** in this package — it's purely type definitions
- Implement these interfaces to create a custom Fluid service backend
- The `protocol/` directory contains the wire protocol types (ops, summaries, proposals)
- Existing implementations: `odsp-driver` (SharePoint), `routerlicious-driver` (Routerlicious), `local-driver` (testing)
- Changes to these interfaces have the **widest impact** across the framework — all drivers must be updated
- Type validation is enabled — interface changes must be backward compatible
