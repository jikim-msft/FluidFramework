# Review Pull Request

Review a GitHub pull request for the FluidFramework repository.

## Input

The user provides a PR number or URL. If no PR is specified, list recent PRs assigned to the user or the top 15 active PRs:
```bash
gh pr list --limit 15 --state open
```

## Prerequisites

Verify GitHub CLI is available:
```bash
bash .claude/scripts/gh-prereqs.sh
```

## Steps

### Step 1: Fetch PR Metadata

```bash
gh pr view <PR_NUMBER> --json title,body,author,baseRefName,headRefName,state,labels,reviewDecision,mergeable,additions,deletions,changedFiles
```

### Step 2: Gather Information (parallel)

Run these in parallel:
1. **PR diff**: `gh pr diff <PR_NUMBER>`
2. **PR comments**: `gh pr view <PR_NUMBER> --json comments,reviews`
3. **PR checks**: `gh pr checks <PR_NUMBER>`
4. **Linked issues**: `gh pr view <PR_NUMBER> --json closingIssuesReferences`
5. **Fetch branch**: `git fetch origin pull/<PR_NUMBER>/head:pr-<PR_NUMBER> 2>/dev/null` and `git log main..pr-<PR_NUMBER> --oneline 2>/dev/null`

### Step 3: Code Review

Review all changes with focus on:

**Code Quality**
- TypeScript strictness (no `any`, no `as`, no `!`)
- Readability, naming conventions, error handling
- Proper async/await usage

**Architecture & Layer Compliance**
- Layer boundary respect (check `PACKAGES.md` if adding cross-package dependencies)
- Proper API tier tagging (`@public`, `@beta`, `@alpha`, `@internal`)
- Import restrictions between layers

**API Surface**
- Are API reports updated? Look for changes in `api-extractor/` and `*.api.md` files
- Are new exports properly tiered?
- Breaking changes documented in changeset?

**Dual Module Support**
- ESM (`lib/`) and CJS (`dist/`) both handled
- No ESM-only dependencies added (check `DEV.md` pinned deps list)
- Export conditions correct in `package.json`

**Testing**
- Adequate test coverage for changes
- Tests run in both ESM and CJS where applicable
- Snapshot tests updated if serialization changes

**Changeset**
- Does the PR have a changeset? (look for `.changeset/*.md` files in diff)
- Is the changeset description accurate?
- Is the bump type correct? (major/minor/patch)

**Performance & Telemetry**
- Hot path changes benchmarked?
- Telemetry events properly structured?
- No PII in telemetry

### Step 4: Output Review

```
## PR Review: #[number] — [title]

**Author**: [author]
**Base**: [base] ← [head]
**Changes**: [files] files (+[additions] -[deletions])
**Labels**: [labels]
**Linked Issues**: [issues]

### Summary
[What this PR does]

### CI Status
[Pass/fail status of checks]

### Existing Discussions
[Summary of existing review comments/threads]

### Findings

#### Critical
[Must-fix issues]

#### Suggestions
[Improvement recommendations]

#### Questions
[Items needing clarification]

### Changeset Review
[Is changeset present, accurate, correct bump type?]

### API Surface Impact
[Changes to public/beta/alpha exports]

### Verdict
[Approve / Approve with suggestions / Request changes]
```

### Step 5: Offer to Comment

Ask the user if they'd like to post review comments on the PR:
```bash
gh pr review <PR_NUMBER> --comment --body "<review_body>"
```

Or post specific file comments:
```bash
gh api repos/microsoft/FluidFramework/pulls/<PR_NUMBER>/comments -f body="<comment>" -f path="<file>" -f position=<line>
```
