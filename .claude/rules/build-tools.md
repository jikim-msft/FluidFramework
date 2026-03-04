---
paths:
  - "build-tools/**"
---

# Build Tools

Internal build infrastructure packages used to build and manage the Fluid Framework monorepo.

## Key Packages

- `@fluidframework/build-tools` — `fluid-build` CLI (task orchestration, incremental builds)
- `@fluid-tools/build-cli` — `flub` CLI (package management, changesets, entrypoint generation, policy checks)
- `@fluidframework/eslint-config-fluid` — Shared ESLint flat config
- `@fluid-tools/benchmark` — Performance benchmarking framework

## Development Notes

- Build-tools has its own pnpm workspace (`build-tools/pnpm-workspace.yaml`)
- Published under both `@fluidframework/` and `@fluid-tools/` namespaces
- Changes here affect every package in the repo — test thoroughly
- `flub` commands used in CI: `flub check policy`, `flub check layers`, `flub generate entrypoints`
