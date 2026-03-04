#!/bin/bash
# GitHub CLI prerequisite check for Claude Code skills
# Usage: bash .claude/scripts/gh-prereqs.sh

set -e

# 1. Check GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "ERROR: GitHub CLI (gh) is not installed."
    echo "Install it: https://cli.github.com/"
    exit 1
fi

# 2. Check GitHub authentication
if ! gh auth status &> /dev/null; then
    echo "ERROR: Not authenticated with GitHub CLI."
    echo "Run: gh auth login"
    exit 1
fi

# 3. Verify we can access the FluidFramework repo
if ! gh repo view microsoft/FluidFramework --json name &> /dev/null; then
    echo "WARNING: Cannot access microsoft/FluidFramework."
    echo "You may need to authenticate with appropriate permissions."
fi

echo "GitHub CLI ready."
