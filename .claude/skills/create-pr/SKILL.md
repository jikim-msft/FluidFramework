# create-pr

Create a GitHub pull request for the FluidFramework repository.

## Prerequisites

Verify GitHub CLI:
```bash
bash .claude/scripts/gh-prereqs.sh
```

Must be on a feature branch (not `main`) with commits ahead of `main`.

## Workflow

### Step 1: Verify Branch State

```bash
# Confirm branch
git branch --show-current

# Confirm not on main
# If on main: error and stop

# Check for uncommitted changes
git status

# Check commits ahead of main
git log main..HEAD --oneline
```

### Step 2: Check for Changesets

Look for changeset files:
```bash
ls .changeset/*.md 2>/dev/null | grep -v config.json | grep -v README
```

If no changeset found, remind the user:
```bash
pnpm changeset
# Or: flub changeset add --releaseGroup client
```

A changeset is required for any code changes that affect published packages.

### Step 3: Analyze Changes

```bash
git diff main..HEAD --stat
git diff main..HEAD
```

Identify:
- Which packages are affected
- Whether API reports need updating
- Type of change (feature, bug fix, refactor, docs, test)

### Step 4: Build Validation

Recommend running checks before creating PR:
```bash
# Quick validation (affected packages only)
fluid-build . --task build --packages <affected_packages>

# Full validation
pnpm checks
```

### Step 5: Gather PR Information

Ask the user for:
1. **PR Title**: Should start with a verb (Add, Fix, Update, Remove, Refactor), under 72 characters
2. **Description**: What changed and why
3. **Test plan**: How the changes were validated

### Step 6: Push and Create PR

```bash
# Push branch
git push -u origin $(git branch --show-current)

# Create PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<description>

## Changes
<list of key changes by package>

## Changeset
<changeset description or "N/A - no published package changes">

## Test Plan
<how changes were validated>

## API Changes
<any API surface changes, or "None">
EOF
)"
```

### Step 7: Post-Creation

Display the PR URL and suggest:
- Adding reviewers based on CODEOWNERS
- Verifying CI checks pass
- Requesting review from package owners (use `/find-owners` skill)

## Branch Naming

Convention: `<username>/<description>` (e.g., `johndoe/fix-tree-merge`)

## PR Title Convention

- Start with verb: Add, Fix, Update, Remove, Refactor, Improve, Enable, Disable
- Under 72 characters
- No period at end
- Reference package if single-package change: "Fix SharedTree merge conflict handling"
