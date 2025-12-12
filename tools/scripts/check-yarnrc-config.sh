#!/bin/bash
# Check if .yarnrc.yml contains uncommented yarnPath line

# Check if .yarnrc.yml is staged
if git diff --cached --name-only | grep -q "^.yarnrc.yml$"; then
  # Check for uncommented yarnPath in the staged file
  # Pattern: line starting with optional spaces, then yarnPath: (no # before it)
  if git show :.yarnrc.yml 2>/dev/null | grep -q "^[^#]*yarnPath:"; then
    echo ""
    echo "❌ ERROR: Cannot commit .yarnrc.yml with uncommented yarnPath!"
    echo ""
    echo "The yarnPath setting must remain commented in the repository."
    echo "Development machines use corepack (Yarn 4.12.0 via packageManager field)."
    echo ""
    echo "This check exists because:"
    echo "  - yarnPath forces all environments to use bundled Yarn 3.3.1"
    echo "  - This conflicts with corepack and Yarn 4's security features"
    echo "  - Legacy servers should uncomment locally (not in git)"
    echo ""
    echo "To fix:"
    echo "  1. Edit .yarnrc.yml and re-comment the yarnPath line"
    echo "  2. Stage the changes: git add .yarnrc.yml"
    echo "  3. Try your commit again"
    echo ""
    echo "If you're on a legacy deployment server, keep it uncommented locally"
    echo "but do not commit this change."
    echo ""
    exit 1
  fi
fi

exit 0
