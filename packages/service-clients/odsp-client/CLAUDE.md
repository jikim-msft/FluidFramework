# @fluidframework/odsp-client

Service client for connecting to **OneDrive/SharePoint (ODSP)** — enables Fluid containers backed by Microsoft 365 storage.

## Architecture

### Source Layout

- `src/odspClient.ts` — `OdspClient` class: creates and loads containers via ODSP (7KB)
- `src/odspAudience.ts` — Audience tracking with ODSP user identity
- `src/odspContainerServices.ts` — Container service bindings for ODSP
- `src/interfaces.ts` — Public types (`OdspClientProps`, `OdspConnectionConfig`, `OdspContainerServices`)
- `src/token.ts` — Token utilities for ODSP authentication

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run build:esnext       # TypeScript ESM compilation
npm run test               # Mocha tests
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Export Tiers

| Path | Content |
|------|---------|
| `.` | Public APIs |
| `./beta` | Beta APIs (most of this package's surface is beta) |
| `./internal` | Full internal API |

## Development Notes

- This package is in **beta** — APIs may change in minor versions
- Requires ODSP/SharePoint authentication tokens (MSAL-based)
- Uses `@fluidframework/odsp-driver` internally for storage operations
- Container data is stored in SharePoint document libraries
- Changes here affect Microsoft 365 integration scenarios
