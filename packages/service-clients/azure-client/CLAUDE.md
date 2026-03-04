# @fluidframework/azure-client

Primary service client for connecting to **Azure Fluid Relay** in production. This is the main entry point for developers building Fluid apps deployed to Azure.

## Architecture

### Source Layout

- `src/AzureClient.ts` — `AzureClient` class: creates and loads Fluid containers against Azure Fluid Relay (12KB)
- `src/AzureAudience.ts` — `AzureAudience`: tracks connected users with Azure-specific member details
- `src/AzureUrlResolver.ts` — Resolves Azure Fluid Relay URLs to storage endpoints
- `src/interfaces.ts` — Public types (`AzureClientProps`, `AzureConnectionConfig`, `AzureLocalConnectionConfig`, `AzureRemoteConnectionConfig`, `IAzureAudience`)
- `src/utils.ts` — Internal utilities

### Consumer Pattern

```typescript
import { AzureClient } from "@fluidframework/azure-client";

// Production: Azure Fluid Relay
const client = new AzureClient({
  connection: {
    type: "remote",
    tenantId: "YOUR_TENANT_ID",
    tokenProvider: new AzureFunctionTokenProvider("https://your-function.azurewebsites.net/api/GetToken", { userId: "user1" }),
    endpoint: "https://your-service.fluidrelay.azure.com",
  },
});

// Development: local Tinylicious
const client = new AzureClient({
  connection: { type: "local", tokenProvider: new InsecureTokenProvider("", { id: "user1" }), endpoint: "http://localhost:7070" },
});

const { container } = await client.createContainer(schema, "2");
```

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
| `.` | Public (`AzureClient`, `AzureAudience`, config types) |
| `./legacy` | Deprecated APIs |
| `./internal` | Full internal API |

## Development Notes

- Supports both **remote** (Azure Fluid Relay) and **local** (Tinylicious) connection modes via the `connection.type` field
- Token providers implement `ITokenProvider` — never store tenant keys in client-side code
- `AzureFunctionTokenProvider` delegates to an Azure Function for secure token generation
- `InsecureTokenProvider` (from `@fluidframework/test-client-utils`) is for local development only
- Changes to this package directly affect the developer onboarding experience
