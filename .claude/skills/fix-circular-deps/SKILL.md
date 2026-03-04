# fix-circular-deps

Fix circular dependency and layer-check violations in the FluidFramework repo.

## Context

Fluid Framework enforces a strict layer hierarchy documented in `PACKAGES.md` and `layerInfo.json`. Violations are caught by:
- `pnpm layer-check` — cross-package layer boundary violations
- Package-level `depcruise` — intra-package import cycle detection

## Input

A package name with circular dependency violations, or output from `pnpm layer-check` or `npm run depcruise`.

## Workflow

### Step 1: Identify Violations

If not already provided, detect violations:
```bash
# Repo-wide layer check
pnpm layer-check

# Package-level import cycles (if package supports it)
cd <package_dir> && npm run depcruise 2>/dev/null
```

### Step 2: Classify Cycle Pattern

For each cycle, identify the pattern:

**Pattern A: Import from own barrel (most common)**
Module imports a sibling through the package's barrel file (`index.ts`) that re-exports that module.
```
moduleA.ts → index.ts → moduleB.ts → moduleA.ts
```
**Fix**: Replace `import { X } from "."` or `import { X } from "./index"` with direct import `import { X } from "./moduleB"`.

**Pattern B: Mutual runtime dependency**
Two modules directly import from each other.
```
moduleA.ts → moduleB.ts → moduleA.ts
```
**Fix**: Extract shared code into a new file, or move the needed function.

**Pattern C: Type-only cycle**
Cycle exists only because of type imports.
**Fix**: Convert to `import type { X } from "./moduleB"` — type-only imports are erased at runtime.

**Pattern D: Cross-layer violation**
A package in a lower layer imports from a higher layer.
**Fix**: Move the shared type/function to a lower-layer package, or restructure to use dependency injection.

### Step 3: Apply Fixes

For each cycle:
1. Only change import paths — do NOT change logic or behavior
2. Verify the fix preserves the same runtime module resolution
3. For barrel re-exports: keep the re-export in `index.ts`, just change the *consumer* import path

### Safe changes:
- Barrel import → direct sibling import
- Mixed import → split into `import type` + `import`
- `import { X }` → `import type { X }` (when only used as type)

### Unsafe changes (require careful review):
- Moving code between files
- Changing module initialization order
- Removing re-exports from barrel files

### Step 4: Verify

```bash
# Layer check (repo-wide)
pnpm layer-check

# Package build
cd <package_dir> && npm run build

# Package depcruise (if available)
cd <package_dir> && npm run depcruise

# Package lint
cd <package_dir> && npm run eslint

# Package tests
cd <package_dir> && npm run test
```

### Step 5: Format

```bash
cd <package_dir> && npm run format
```

## Common Pitfalls

- Barrel files (`index.ts`) are the #1 source of import cycles — avoid importing from `"."` within the same package
- Don't just suppress the cycle — actually break the dependency chain
- Don't change exports or re-exports that other packages depend on
- Changing import order can affect module initialization — verify behavior
- Layer violations may require coordination across packages
