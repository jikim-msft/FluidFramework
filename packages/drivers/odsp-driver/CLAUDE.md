# @fluidframework/odsp-driver

Storage driver for SharePoint Online and OneDrive for Business (ODSP). Implements the Fluid driver interfaces for connecting to Microsoft's production storage service.

## Architecture

### Source Layout

- `src/odspDocumentServiceFactory.ts` — Entry point factory
- `src/odspDocumentServiceFactoryCore.ts` — Core factory implementation
- `src/odspDocumentService.ts` — Document service (coordinates storage + delta stream)
- `src/odspDocumentStorageManager.ts` — Storage operations (snapshots, blobs, summaries, 31KB)
- `src/odspDocumentStorageServiceBase.ts` — Base storage service (10KB)
- `src/odspDocumentDeltaConnection.ts` — WebSocket delta connection (29KB)
- `src/odspDelayLoadedDeltaStream.ts` — Lazy delta stream loading (21KB)
- `src/odspDeltaStorageService.ts` — Delta (op) storage service
- `src/fetchSnapshot.ts` — Snapshot fetching logic (29KB)
- `src/epochTracker.ts` — Epoch-based cache invalidation (22KB)
- `src/odspDriverUrlResolver.ts` — URL resolution for ODSP
- `src/odspDriverUrlResolverForShareLink.ts` — Share link URL resolution (11KB)
- `src/odspFluidFileLink.ts` — Fluid file link handling
- `src/getFileLink.ts` — File link generation (12KB)
- `src/odspUtils.ts` — ODSP utility functions (21KB)
- `src/vroom.ts` — Vroom API integration (join session)
- `src/compactSnapshotParser.ts` — Binary snapshot parsing
- `src/compactSnapshotWriter.ts` — Binary snapshot writing
- `src/zipItDataRepresentationUtils.ts` — Binary data format utilities (19KB)
- `src/createFile/` — File creation operations
- `src/localOdspDriver/` — Local ODSP driver for testing
- `src/opsCaching.ts` — Op caching for offline scenarios
- `src/retryUtils.ts` — Retry logic for transient failures
- `src/odspCache.ts` — Caching layer
- `src/odspLayerCompatState.ts` — Layer compatibility state
- `src/odspLocationRedirection.ts` — Geographic location redirection

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

- This is the **production storage driver** used by Microsoft 365 — changes affect real users
- Epoch tracking (`epochTracker.ts`) is critical for cache coherence — don't bypass
- Snapshot format uses a compact binary representation (`zipItDataRepresentationUtils.ts`)
- Retry logic handles throttling (429), transient network errors, and epoch mismatches
- `localOdspDriver/` provides a local mock for testing without network
- URL resolution handles multiple ODSP URL formats (share links, direct links, tenant-specific)
- Authentication tokens are passed via callback — the driver never stores credentials
