---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.mts"
  - "**/*.cts"
  - "**/*.js"
  - "**/*.mjs"
---

# Code Style Rules

Fluid Framework uses Biome for formatting and ESLint for linting. All generated code must pass both.

## Formatting (Biome)

- **Indentation**: Tabs (not spaces)
- **Line width**: 95 characters (120 for `@fluid-experimental/tree`)
- **Semicolons**: Always required
- **Quotes**: Double quotes (`"`) for strings
- **Trailing commas**: Always — in arrays, objects, function parameters
- **Arrow parens**: Always required — `(x) => x`, never `x => x`
- **Bracket spacing**: `{ a: 1 }` not `{a: 1}`
- **Line endings**: LF (`\n`)

## Import Rules

- **No default exports** — always use named exports (`export const`, `export function`, `export class`)
- **Import order** (alphabetical within each group, blank lines between groups):
  1. Node builtins (`node:fs`, `node:path`)
  2. External packages (`@fluidframework/*`, third-party)
  3. Parent imports (`../`)
  4. Sibling imports (`./`)
- **No internal module imports** — don't import from subpaths of packages unless using `/internal` or `/beta` entry points
- **All imports must be in package.json** — no extraneous dependencies

## Type Safety

- **No `!` non-null assertions** — use type narrowing or guards instead
- **Prefer `unknown` over `any`** — narrow with type guards
- **Indexed access returns `T | undefined`** — due to `noUncheckedIndexedAccess`
- **Optional vs undefined distinction** — `prop?: T` differs from `prop: T | undefined` due to `exactOptionalPropertyTypes`

## Async / Promises

- **No floating promises** — every promise must be awaited, returned, or explicitly voided
- **Use `return await`** — not bare `return promise`
- **Functions returning promises should be `async`**

## Variables & Naming

- **`const` by default** — use `let` only when reassignment is needed; never `var`
- **No variable shadowing** — don't reuse outer scope names
- **Filenames**: camelCase or PascalCase only

## Code Patterns

- **Always use braces** — `if (x) { doThing(); }`, never `if (x) doThing();`
- **`===` over `==`** — strict equality (except `== null` for null/undefined check)
- **`for...of` over `for...in`** — or use `Object.entries()`
- **Template literals** over string concatenation
- **Object spread** — `{ ...obj }` over `Object.assign()`
- **Prefer arrow functions** in callbacks
- **`switch` must have `default` case**
- **Don't reassign function parameters**
- **Throw only `Error` objects** — never throw strings or other primitives
- **Reject with `Error` objects** — `Promise.reject(new Error(...))`, not `Promise.reject("msg")`

## Array & Object Types

- **`Type[]`** not `Array<Type>` for array types
- **`Record<K, V>`** not `{ [key: K]: V }` for indexed types
- **Explicit generics at construction** — `new Map<K, V>()` not `new Map()`

## JSDoc (strict config packages)

- Exported functions, classes, interfaces, and types need JSDoc comments
- No hyphens after JSDoc tags — `@deprecated Use X` not `@deprecated - Use X`
- No file path links or markdown links in JSDoc

## Test Files (`src/test/**`)

Test files have relaxed rules:
- Imports from `@fluid*/**` subpaths are allowed
- `this` binding rules are relaxed (for Mocha's `this` context)
- Unused variables and type import consistency are not enforced
