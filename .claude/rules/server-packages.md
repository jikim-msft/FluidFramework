---
paths:
  - "server/**"
---

# Server Packages

Reference implementation of the Fluid ordering service and supporting microservices.

## Release Groups

- **routerlicious** (`server/routerlicious/`) — Main ordering service, has its own pnpm workspace
- **gitrest** (`server/gitrest/`) — Git-backed storage, own pnpm workspace
- **historian** (`server/historian/`) — Document history service, own pnpm workspace

## Important

- Each server release group has its own `pnpm-workspace.yaml` and independent versioning
- Run `pnpm install` from the specific server workspace root, not the repo root
- Build with `fluid-build` scoped to the release group: `fluid-build -g server --task build`
- Server packages are published under `@fluidframework/` namespace (same as client)
- Docker compose available: `pnpm start:docker` (from repo root)
