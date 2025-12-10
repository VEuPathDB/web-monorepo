#!/usr/bin/env node

/**
 * Verifies that corepack is properly configured with the correct Yarn version.
 * This runs as a preinstall hook to catch misconfigurations early.
 *
 * Note: npm usage is blocked naturally because this monorepo uses Yarn-specific
 * features (workspace:^ protocol) that npm doesn't understand.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Check for bypass environment variable for legacy deployment environments
const skipCheck = process.env.SKIP_YARN_VERSION_CHECK;

if (skipCheck === 'true' || skipCheck === '1') {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  SKIP_YARN_VERSION_CHECK enabled - skipping package manager version checks');
  console.warn('\x1b[2m%s\x1b[0m', 'This should only be used on legacy deployment servers that cannot upgrade Node.js.');
  process.exit(0);
}

// Check for required development environment variables
const ignorePathSet = process.env.YARN_IGNORE_PATH === 'true' || process.env.YARN_IGNORE_PATH === '1';
const ageGateValue = parseInt(process.env.YARN_NPM_MINIMAL_AGE_GATE || '0', 10);

if (!ignorePathSet) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error: YARN_IGNORE_PATH is not set to true');
  console.error('\x1b[33m%s\x1b[0m', '\nYou are likely using the bundled Yarn 3.3.1 instead of Yarn 4.12.0 via corepack.');
  console.error('\x1b[2m%s\x1b[0m', 'Add to your shell profile (~/.bashrc, ~/.zshrc, etc.):');
  console.error('\x1b[2m%s\x1b[0m', '  export YARN_IGNORE_PATH=true');
  console.error('\x1b[2m%s\x1b[0m', '\nSee README.adoc "Required Environment Variables for Development" section.');
  process.exit(1);
}

if (ageGateValue === 0) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  Warning: YARN_NPM_MINIMAL_AGE_GATE is not set');
  console.warn('\x1b[2m%s\x1b[0m', 'For supply chain security, add to your shell profile:');
  console.warn('\x1b[2m%s\x1b[0m', '  export YARN_NPM_MINIMAL_AGE_GATE=10080');
  console.warn('\x1b[2m%s\x1b[0m', 'This requires NPM packages to be at least 7 days old before installation.');
  // Don't exit - just warn
}

// Get the repo root (two directories up from this script)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..', '..');

// Read expected version from package.json
const packageJson = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf-8'));
const expectedVersion = packageJson.packageManager?.replace('yarn@', '');

if (!expectedVersion) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error: packageManager field not found in package.json');
  process.exit(1);
}

// Check if yarn version is correct (verifies corepack is working)
// The user agent string contains the actual running package manager version
const userAgent = process.env.npm_config_user_agent || '';
const match = userAgent.match(/yarn\/(\S+)/);
const actualVersion = match ? match[1] : '';

if (actualVersion !== expectedVersion) {
  console.error('\x1b[31m%s\x1b[0m', `❌ Error: Expected Yarn ${expectedVersion} but got ${actualVersion || 'unknown version'}.`);
  console.error('\x1b[33m%s\x1b[0m', '\nThis likely means corepack is not enabled.');
  console.error('\x1b[2m%s\x1b[0m', '\nSee README.adoc Prerequisites section for setup instructions.');
  process.exit(1);
}

// All checks passed
console.log('\x1b[32m%s\x1b[0m', '✓ Yarn version check passed');
