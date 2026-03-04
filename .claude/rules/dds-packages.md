---
paths:
  - "packages/dds/**"
---

# Distributed Data Structures (DDS)

DDS packages are the core data models for Fluid's real-time collaboration.

## Packages

- `packages/dds/tree` — SharedTree (primary DDS for hierarchical data)
- `packages/dds/map` — SharedMap (key-value)
- `packages/dds/sequence` — SharedString (text sequences)
- `packages/dds/counter` — SharedCounter
- `packages/dds/cell` — SharedCell

## Development Notes

- DDS packages are in the **DataStore** layer — they can only depend on packages in lower layers (Runtime, Loader, Driver, or shared utils)
- Run `pnpm layer-check` to verify layer boundaries after adding dependencies
- All DDS packages ship dual ESM/CJS and expose multiple API tiers (public, beta, alpha, legacy, internal)
- API reports must be regenerated after public API changes: `npm run build:api-reports`
- Tests include production-mode emulation (`test:mocha:prod`) — run this when changing branching logic that uses `process.env.NODE_ENV`
- Snapshot tests exist for serialization compatibility — run `test:snapshots:regen` if format changes are intentional
- Benchmarks: `npm run bench` (uses `@fluid-tools/benchmark` with Mocha)
