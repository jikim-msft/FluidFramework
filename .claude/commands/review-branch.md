# Review Current Branch

Perform a thorough code review of all changes on the current branch compared to main.

## Prerequisites

- Must be on a feature branch (not `main`)
- Git must be available

## Steps

### Step 1: Verify Branch

Run `git branch --show-current` to confirm we're not on `main`. If on `main`, warn the user and stop.

### Step 2: Gather Changes

Run the following 3 commands in parallel:
1. `git log main..HEAD --oneline --no-decorate` — list of commits
2. `git diff main..HEAD --stat` — changed files with statistics
3. `git diff main..HEAD` — full diff of all changes

### Step 3: Code Review

Review all changes across these categories:

**Code Quality**
- Readability, naming, complexity
- Error handling and edge cases
- TypeScript strictness (no `any`, no `as` assertions, no `!` non-null assertions)
- Proper use of `?.` and `??` operators

**Architecture & Design**
- Layer boundary compliance (Driver → Loader → Runtime → DataStore)
- Proper API tier tagging (`@public`, `@beta`, `@alpha`, `@internal`)
- Separation of concerns, single responsibility

**API Surface**
- Are API reports updated? (`npm run build:api-reports`)
- Are new exports tagged with the correct tier?
- Are breaking changes documented?
- Do dual ESM/CJS exports work correctly?

**Performance**
- Unnecessary allocations in hot paths
- Missing memoization for expensive computations
- N+1 patterns in data access
- Large objects in telemetry events

**Testing**
- Are new features tested?
- Do tests cover both ESM and CJS variants where applicable?
- Are fuzz/stress tests needed for new DDS operations?
- Snapshot compatibility tests if serialization format changes

**Security**
- Input validation at system boundaries
- No secrets in source code or telemetry
- Proper error sanitization before logging

**Compatibility**
- Backward compatibility of serialized data formats
- Layer compatibility generation numbers
- Type validation for public APIs

### Step 4: Output Review

Present findings in this format:

```
## Code Review: [branch-name]

**Branch**: [branch] → main
**Commits**: [count]
**Files changed**: [count] (+[additions] -[deletions])

### Summary
[1-2 sentence summary of the changes]

### Changes Overview
[Grouped list of changes by category/package]

### Findings

#### Critical
[Must-fix issues]

#### Suggestions
[Improvement recommendations]

#### Questions
[Items needing clarification]

### API Surface Impact
[Any changes to public/beta/alpha APIs]

### Verdict
[Approve / Approve with suggestions / Request changes]
```
