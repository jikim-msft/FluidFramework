# Triage GitHub Issues

Review and triage open GitHub issues for the FluidFramework repository.

## Prerequisites

Verify GitHub CLI is available:
```bash
bash .claude/scripts/gh-prereqs.sh
```

## Steps

### Step 1: Fetch Issues

Fetch untriaged issues (no `triaged` label):

```bash
gh issue list --repo microsoft/FluidFramework --state open --label "bug" --json number,title,labels,author,createdAt,body --limit 30
```

For a specific label:
```bash
gh issue list --repo microsoft/FluidFramework --state open --label "<label>" --json number,title,labels,author,createdAt,body --limit 30
```

### Step 2: Analyze Each Issue

For each issue, determine:

1. **Category**: Bug, Feature Request, Question, Documentation, Performance
2. **Affected Layer**: Which architectural layer? (Driver, Loader, Runtime, DataStore, Framework, Build Tools)
3. **Affected Package**: Which `@fluidframework/*` package?
4. **Severity Assessment**:
   - **P0** — Data loss, crash, security vulnerability
   - **P1** — Major feature broken, no workaround
   - **P2** — Feature degraded, workaround exists
   - **P3** — Minor issue, cosmetic, nice-to-have
5. **Reproducibility**: Can it be reproduced from the description?

### Step 3: Find Owner

Use the `/find-owners` skill or check:
1. `CODEOWNERS` file for path-based ownership
2. `git log --format="%an" -- <affected-files> | sort | uniq -c | sort -rn | head -5` for recent contributors
3. Package `package.json` for maintainer info

### Step 4: Categorize

Group issues into two categories:

**Category 1: High Confidence** — Clear bug, clear owner, clear priority
- Present as batch for user approval

**Category 2: Needs Discussion** — Ambiguous, cross-cutting, or unclear priority
- Present individually for user review

### Step 5: Present Recommendations

For each issue, show:

| # | Title | Priority | Package | Recommended Owner | Action |
|---|-------|----------|---------|-------------------|--------|

### Step 6: Apply (with user approval)

For approved issues:
```bash
# Add labels
gh issue edit <NUMBER> --add-label "triaged,P<N>,<package-label>"

# Assign
gh issue edit <NUMBER> --add-assignee <username>

# Add comment with triage notes
gh issue comment <NUMBER> --body "<triage_notes>"
```

### Step 7: Summary

Report:
- Total issues processed
- Auto-approved (Category 1)
- Manually reviewed (Category 2)
- Skipped
- Breakdown by priority and package
