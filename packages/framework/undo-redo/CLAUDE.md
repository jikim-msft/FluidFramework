# @fluidframework/undo-redo

In-memory undo/redo stack manager with handlers for SharedMap and SharedString (SharedSegmentSequence).

## Architecture

### Source Layout

- `src/undoRedoStackManager.ts` — `UndoRedoStackManager` class: manages undo/redo stacks with operation tracking (5KB)
- `src/mapHandler.ts` — Undo/redo handler for `SharedMap` operations
- `src/sequenceHandler.ts` — Undo/redo handler for `SharedSegmentSequence` (SharedString) operations
- `src/index.ts` — Public exports and type definitions (5KB)

### Key Concepts

- The stack manager tracks reversible operations and manages undo/redo ordering
- Handlers for specific DDSes translate DDS operations into reversible commands
- SharedTree has its own built-in undo/redo (see `@fluidframework/tree`) — this package is for legacy DDSes

### Consumer Pattern

```typescript
import { UndoRedoStackManager, SharedMapUndoRedoHandler } from "@fluidframework/undo-redo";

const undoRedoStack = new UndoRedoStackManager();
const mapHandler = new SharedMapUndoRedoHandler(undoRedoStack);
mapHandler.attachMap(sharedMap);

undoRedoStack.undoOperation();  // undo last change
undoRedoStack.redoOperation();  // redo
```

## Commands

```bash
npm run build              # Full build (ESM + CJS)
npm run test               # Mocha tests
npm run eslint             # ESLint
npm run format             # Biome formatting
```

## Development Notes

- For **SharedTree** undo/redo, use the tree's built-in revertible API instead of this package
- This package is primarily for SharedMap and SharedString undo/redo
- The `@fluidframework/react` package also provides React hooks for undo/redo
- Stack manager is in-memory only — undo history is lost on page refresh
