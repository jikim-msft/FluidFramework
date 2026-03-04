# @fluidframework/telemetry-utils

Logging, telemetry, and event tracking utilities used by every Fluid Framework package.

## Architecture

### Source Layout

- `src/logger.ts` — Core logger implementation and utilities (30KB)
- `src/error.ts` — Error classification and normalization (13KB)
- `src/errorLogging.ts` — Error logging helpers (16KB)
- `src/fluidErrorBase.ts` — Base class for Fluid errors
- `src/layerCompatError.ts` — Layer compatibility error handling
- `src/config.ts` — Configuration utilities (13KB)
- `src/sampledTelemetryHelper.ts` — Sampled telemetry for high-frequency events (11KB)
- `src/telemetryEventBatcher.ts` — Batching telemetry events
- `src/telemetryTypes.ts` — Telemetry type definitions
- `src/events.ts` — Event utilities
- `src/eventEmitterWithErrorHandling.ts` — Error-safe event emitter
- `src/mockLogger.ts` — Mock logger for testing (13KB)
- `src/utils.ts` — General utilities
- `src/mathTools.ts` — Math helpers
- `src/thresholdCounter.ts` — Threshold-based counting

### Key Patterns

- **Structured logging**: All telemetry uses structured key-value properties
- **Error normalization**: Errors are normalized to `IFluidErrorBase` before logging
- **Sampled telemetry**: High-frequency events use sampling to reduce volume
- **Mock logger**: `MockLogger` class for asserting telemetry in tests

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run build:esnext       # TypeScript ESM compilation
npm run build:api-reports  # Regenerate API reports

# Testing
npm run test               # Mocha tests
npm run test:coverage      # With c8 coverage

# Quality
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Development Notes

- Used by nearly every package — changes here affect the entire framework
- `MockLogger` from `src/mockLogger.ts` is widely used in tests across the repo
- Error normalization must handle arbitrary `unknown` thrown values safely
- Sampled telemetry has precise statistical properties — don't change sampling logic without understanding the math
- Layer compatibility errors have special handling for cross-version scenarios
