# @fluidframework/react

React integration utilities for Fluid Framework — primarily for binding SharedTree data to React components.

## Architecture

### Source Layout

- `src/useTree.ts` — `useTree` hook: subscribes React components to SharedTree changes (5KB)
- `src/useObservation.ts` — `useObservation` hook: generic observable subscription for React (16KB)
- `src/reactSharedTreeView.tsx` — React component wrappers for SharedTree views (11KB)
- `src/undoRedo.ts` — React hooks for undo/redo with Fluid (3KB)
- `src/propNode.ts` — Property node utilities for React integration (5KB)
- `src/text/` — Text-specific React utilities
- `src/simpleIdentifier.ts` — Simple identifier utilities

### Key Concepts

- `useTree(node)` — Re-renders React component when the SharedTree node or its descendants change
- Handles SharedTree's change detection and subscription lifecycle automatically
- ESM-only — no CJS build (React apps are typically bundled)

### Consumer Pattern

```typescript
import { useTree } from "@fluidframework/react";

function MyComponent({ treeNode }) {
  const data = useTree(treeNode);  // re-renders on any change
  return <div>{data.name}</div>;
}
```

## Commands

```bash
npm run build              # Build (ESM only)
npm run build:esnext       # TypeScript ESM compilation
npm run test               # Jest tests (browser/React testing)
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Export Tiers

| Path | Content |
|------|---------|
| `.` | Public (`useTree`) |
| `./alpha` | Alpha APIs |
| `./beta` | Beta APIs |
| `./internal` | Full internal API |

Note: **ESM only** — no CJS exports.

## Development Notes

- ESM-only package — no `./dist` CJS output, only `./lib` ESM
- Uses React 18 APIs — not compatible with React 16/17
- `useObservation.ts` (16KB) is the generic observation engine that powers `useTree`
- Test suite uses Jest (not Mocha) because of React/DOM testing requirements
- Changes to `useTree` must preserve referential equality guarantees for React memoization
