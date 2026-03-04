# decode-stacktrace

Decode stack traces to identify responsible code, recent changes, and the most likely culprit commit or PR.

## Input

A stack trace pasted by the user or referenced in a GitHub issue. Supports:
- JavaScript/TypeScript development traces
- Minified/production stack traces (with source map hints)
- Node.js server stack traces

## Workflow

### Step 1: Parse Stack Trace

Extract from each frame:
- Function name
- File path (resolve relative paths to repo)
- Line number and column number
- Package name (from file path)

### Step 2: Locate Source Files

For each stack frame, find the source file:
```bash
# Map built output paths back to source
# lib/ → src/ (ESM output)
# dist/ → src/ (CJS output)
```

Use Glob to find source files matching the frame paths. Read the relevant source lines for context.

### Step 3: Analyze Git History

For each identified source file, run in parallel:

1. **Git blame on error lines**:
```bash
git blame -L <line-5>,<line+5> -- <source_file>
```

2. **Recent commits touching the file**:
```bash
git log --oneline -10 -- <source_file>
```

3. **Commits touching the specific function** (if identifiable):
```bash
git log --oneline -5 -S "<function_name>" -- <source_file>
```

### Step 4: Find Associated PRs

For each suspect commit, find the associated PR:
```bash
gh pr list --search "<commit_hash>" --state merged --json number,title,author,mergedAt --limit 3
```

Or from commit message:
```bash
git show --format="%s" -s <commit_hash>
# Look for PR number patterns like (#1234)
```

### Step 5: Identify Most Likely Culprit

Score each candidate commit/PR by:
1. **Recency** (highest weight) — more recent changes are more likely culprits
2. **Proximity** — changes closer to the error line score higher
3. **Scope** — how many stack trace files were touched by this commit
4. **Change type** — feature/refactor changes score higher than test/doc changes
5. **Change size** — larger changes have more risk

### Step 6: Present Analysis

```
## Stack Trace Analysis

### Error
[Error message and type]

### Stack Frames
| # | Function | File | Line | Package |
|---|----------|------|------|---------|

### Most Likely Culprit
**PR #[number]**: [title]
**Author**: [author]
**Merged**: [date]
**Confidence**: [High/Medium/Low]
**Reason**: [explanation]

### Suspect Commits
| Commit | Author | Date | Files Changed | Score |
|--------|--------|------|---------------|-------|

### Rollback Options
- **Option A**: Revert specific commit: `git revert <hash>`
- **Option B**: Revert full PR: `git revert -m 1 <merge_hash>`
- **Option C**: Create fix-forward branch from pre-regression: `git checkout -b fix/<issue> <safe_hash>`

### Warnings
[Any potential side effects of rollback]
```
