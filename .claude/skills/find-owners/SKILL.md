# find-owners

Find package owners, code owners, and subject matter experts in the FluidFramework repository.

## Trigger

User asks: "who owns X", "find owner of X", "who to contact about X", "SME for X", "expert on X"

## Input

A package name, file path, or topic (e.g., "SharedTree", "container-runtime", "gc", "odsp-driver").

## Workflow

### Step 1: Check CODEOWNERS

Search the CODEOWNERS file for matching path patterns:
```bash
cat .github/CODEOWNERS 2>/dev/null || echo "No CODEOWNERS file found"
```

Match the input against path patterns to find designated owners.

### Step 2: Find Package

Locate the relevant package:
```bash
# Search by package name
find packages/ experimental/ azure/ -name "package.json" -maxdepth 3 | xargs grep -l "<search_term>" 2>/dev/null | head -10
```

Or use glob patterns to find source files:
```
packages/**/*<search_term>*
```

### Step 3: Analyze Git History

Run these in parallel for the identified package/directory:

1. **Recent contributors** (last 6 months):
```bash
git log --since="6 months ago" --format="%an <%ae>" -- <package_path> | sort | uniq -c | sort -rn | head -10
```

2. **Historical contributors** (last 2 years):
```bash
git log --since="2 years ago" --format="%an <%ae>" -- <package_path> | sort | uniq -c | sort -rn | head -10
```

3. **Recent meaningful commits** (last 6 months, excluding noise):
```bash
git log --since="6 months ago" --oneline --no-merges -- <package_path> | grep -v -i -e "bump" -e "version" -e "format" -e "lint" -e "eslint" -e "biome" | head -15
```

### Step 4: Filter Noise

Exclude from contributor lists:
- Bot accounts (dependabot, github-actions, etc.)
- Automated commits (version bumps, formatting, linting)
- CI/CD related changes

### Step 5: Output

Present results in this format:

```
## Ownership: <package/area>

### CODEOWNERS
| Path Pattern | Owners |
|---|---|
| <pattern> | @owner1, @owner2 |

### Subject Matter Experts

**Active (last 6 months)**
| Contributor | Commits | Focus Areas |
|---|---|---|
| Name <email> | N | area description |

**Foundational (6mo-2yr)**
| Contributor | Commits | Focus Areas |
|---|---|---|
| Name <email> | N | area description |

### Recent Commits
| Hash | Author | Description |
|---|---|---|
| abc1234 | Name | commit message |
```
