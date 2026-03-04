---
paths:
  - "**/eslint.config.*"
  - "common/build/eslint-config-fluid/**"
---

# ESLint Configuration

## Setup

- ESLint v9 with flat config (`eslint.config.mts`)
- Shared config: `@fluidframework/eslint-config-fluid` (in `common/build/eslint-config-fluid/`)
- TypeScript-eslint with `projectService: true` by default

## projectService vs Explicit Project Arrays

`projectService: true` is preferred — it uses TypeScript's Language Service API for accurate type info. However, some packages need explicit `parserOptions.project` arrays when:

- Files use non-standard tsconfig names (e.g., `tsconfig.jest.json`) not referenced from `tsconfig.json`
- Test files are intentionally excluded from the main tsconfig graph
- Files need different compiler settings than projectService would provide

Packages using explicit arrays have comments in their `eslint.config.mts` explaining why.

## Key Rules

- Custom plugin: `@fluid-internal/eslint-plugin-fluid`
- `eslint-plugin-import-x` for import validation
- `eslint-plugin-jsdoc` for documentation
- Run `npm run eslint` to lint, `npm run eslint:fix` to auto-fix

## CLI vs VS Code Discrepancies

If ESLint errors differ between CLI and VS Code, check projectService settings. VS Code's ESLint extension may default to `projectService: true` while the CLI uses what's in `eslint.config.mts`. See `DEV.md` for details.
