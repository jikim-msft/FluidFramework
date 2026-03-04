---
paths:
  - "**/api-extractor/**"
  - "**/src/index.ts"
  - "**/package.json"
---

# API Exports & Entrypoints

Fluid Framework packages use a multi-tier API export system managed by API Extractor.

## Export Conditions

Each package defines conditional exports in `package.json`:
- `import` — ESM entry (`./lib/*.js` + `./lib/*.d.ts`)
- `require` — CJS entry (`./dist/*.js` + `./dist/*.d.ts`)
- `internal` — Full internal API surface
- `allow-ff-test-exports` — Test-only exports (conditional)

## API Tiers

APIs are tagged with `@public`, `@beta`, `@alpha`, `@internal` in JSDoc. API Extractor generates separate `.d.ts` rollups per tier:
- `public.d.ts` — Stable APIs
- `beta.d.ts` — Beta APIs (may break in minor)
- `alpha.d.ts` — Alpha APIs (may break any time)
- `legacy.d.ts` — Deprecated APIs

## Workflow

1. Add/modify exports with appropriate `@public`/`@beta`/`@alpha` tags
2. Run `npm run build:esnext` to compile
3. Run `flub generate entrypoints` to regenerate `.d.ts` rollups
4. Run `npm run build:api-reports` to update API reports
5. Verify with `npm run check:exports` and `npm run check:are-the-types-wrong`

## Common Issues

- Adding a new public API without updating API reports will fail CI
- `@internal` APIs are accessible via `./internal` import but not via `.` — this is intentional
- CJS and ESM API reports are validated separately
