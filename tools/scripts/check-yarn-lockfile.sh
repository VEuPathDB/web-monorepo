#!/bin/bash
# Check if yarn.lock is being committed with Yarn 3 format (should be Yarn 4)

# Check if yarn.lock is staged
if git diff --cached --name-only | grep -q "^yarn.lock$"; then
  # Get the version from the staged yarn.lock
  LOCKFILE_VERSION=$(git diff --cached yarn.lock | grep "^+.*version:" | head -1 | sed 's/^+.*version: //')

  if [ "$LOCKFILE_VERSION" = "6" ]; then
    echo ""
    echo "❌ ERROR: Cannot commit yarn.lock with Yarn 3 format!"
    echo ""
    echo "The yarn.lock file has 'version: 6' (Yarn 3 format)."
    echo "This repository requires 'version: 8' (Yarn 4 format)."
    echo ""
    echo "This usually happens when:"
    echo "  - You ran yarn commands without YARN_IGNORE_PATH=true"
    echo "  - You're on a legacy deployment server (should never commit from there)"
    echo ""
    echo "To fix:"
    echo "  1. Unstage yarn.lock: git restore --staged yarn.lock"
    echo "  2. Revert changes: git restore yarn.lock"
    echo "  3. Set YARN_IGNORE_PATH=true in your shell profile"
    echo "  4. Try your operation again with Yarn 4"
    echo ""
    exit 1
  fi

  # Optional: Also warn if version is not 8 (unexpected version)
  if [ -n "$LOCKFILE_VERSION" ] && [ "$LOCKFILE_VERSION" != "8" ]; then
    echo ""
    echo "⚠️  WARNING: yarn.lock has unexpected version: $LOCKFILE_VERSION"
    echo "Expected version: 8 (Yarn 4 format)"
    echo ""
  fi
fi

exit 0
