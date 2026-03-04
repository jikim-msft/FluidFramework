# review-api-changes

Review changes to the public API surface of Fluid Framework packages. Validates API reports, export tiers, and backward compatibility.

## Trigger

Use when:
- PR modifies public/beta/alpha APIs
- New exports are added to a package
- API Extractor reports need review
- Type validation tests fail

## Input

A package name, PR number, or file path with API changes.

## Workflow

### Step 1: Identify Changed APIs

Check for API report changes:
```bash
# If reviewing a PR
gh pr diff <PR_NUMBER> -- "**/*.api.md" "**/api-extractor/**"

# If reviewing local changes
git diff main -- "**/*.api.md" "**/api-extractor/**"
```

Check for export changes:
```bash
git diff main -- "**/index.ts" "**/package.json"
```

### Step 2: Validate API Reports Are Current

For each affected package:
```bash
cd <package_dir>

# Build first
npm run build:esnext

# Generate entrypoints
npm run api-extractor:esnext

# Regenerate reports
npm run build:api-reports

# Check if reports match
git diff -- api-extractor/
```

If reports are stale, they must be regenerated.

### Step 3: Validate Export Tiers

Check that APIs are tagged correctly:

| Tag | Tier | Stability |
|-----|------|-----------|
| `@public` | `.` | Semver-protected, breaking changes require major version |
| `@beta` | `./beta` | May change in minor versions |
| `@alpha` | `./alpha` | May change at any time |
| `@internal` | `./internal` | Not for external consumers |
| (no tag) | `@public` by default | Must be intentional |

For each new/changed export:
1. Is the tier appropriate for the API's maturity?
2. Is it tagged in JSDoc?
3. Does it appear in the correct `.d.ts` rollup?

### Step 4: Check Backward Compatibility

```bash
cd <package_dir>

# Type validation tests
npm run typetests:gen

# Are-the-types-wrong check
npm run check:are-the-types-wrong

# Full export validation
npm run check:exports
```

### Step 5: Review Breaking Changes

If any `@public` or `@beta` API has changed:

1. **Removals**: Is there a deprecation path? Should it move to `./legacy`?
2. **Signature changes**: Are existing consumers updated?
3. **Type changes**: Is the change narrowing (safe) or widening (potentially breaking)?
4. **Default value changes**: Could existing behavior change?

### Step 6: Validate Dual Module Exports

Check both ESM and CJS:
```bash
cd <package_dir>

# ESM exports
npm run check:exports:esm:public
npm run check:exports:esm:beta 2>/dev/null
npm run check:exports:esm:alpha 2>/dev/null

# CJS exports
npm run check:exports:cjs:public
npm run check:exports:cjs:beta 2>/dev/null
npm run check:exports:cjs:alpha 2>/dev/null

# Bundle release tags
npm run check:exports:bundle-release-tags
```

### Step 7: Output Review

```
## API Change Review: @fluidframework/<package>

### New APIs
| API | Tier | File | Notes |
|-----|------|------|-------|

### Modified APIs
| API | Tier | Change | Breaking? |
|-----|------|--------|-----------|

### Removed APIs
| API | Previous Tier | Replacement | Notes |
|-----|---------------|-------------|-------|

### Validation Results
- [ ] API reports are current
- [ ] Export tiers are correct
- [ ] Type validation passes
- [ ] are-the-types-wrong passes
- [ ] ESM exports valid
- [ ] CJS exports valid
- [ ] Changeset documents API changes
- [ ] Breaking changes have deprecation path

### Recommendations
[Specific recommendations for the API changes]
```
