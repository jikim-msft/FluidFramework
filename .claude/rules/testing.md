---
paths:
  - "**/src/test/**"
  - "**/.mocharc.*"
  - "**/jest.config.*"
---

# Testing Patterns

## Test Location

Tests are co-located with source code in `src/test/` directories. Each package compiles tests separately:
- `src/test/tsconfig.json` — ESM test build
- `src/test/tsconfig.cjs.json` — CJS test build

## Running Tests

```bash
# From a package directory:
npm run test:mocha          # Run all mocha tests (ESM + CJS + prod variants)
npm run test:mocha:esm      # ESM only
npm run test:mocha:cjs      # CJS only
npm run test:mocha:prod     # Production mode emulation
npm run test:jest           # Browser tests (requires Chrome)
npm run test:coverage       # With coverage via c8

# From repo root (all packages):
pnpm build-and-test         # Full build + test
pnpm test                   # All test variants
```

## Test Variants

- **ESM vs CJS**: Tests run in both module systems to catch dual-build issues
- **Production mode**: `test:mocha:prod` uses `--emulateProduction` to simulate production behavior
- **Real service**: `test:realsvc` tests against actual Fluid services (tinylicious or local)
- **Stress tests**: `test:stress` for load/concurrency testing
- **Benchmarks**: `test:benchmark:report` for performance regression tracking

## Conventions

- Test files: `*.spec.ts` or `*.test.ts`
- Use `describe`/`it` blocks (Mocha style)
- Tests that check specific scenarios should use `@Smoke` tag for fast CI runs
- Snapshot tests for serialization format compatibility — don't regenerate without understanding the implications
