/*
 * Update the version of a package.
 *
 * Usage: node tools/scripts/version.mjs packages/sites/genomics-site 1.0.2
 */

import { readFileSync, writeFileSync } from 'fs';

const [ , , packageDir, version ] = process.argv;

try {
  const json = JSON.parse(readFileSync(packageDir + '/package.json'));
  json.version = version;
  writeFileSync(packageDir + '/package.json', JSON.stringify(json, null, 2));
}
catch (error) {
  console.error(error);
  process.exit(1);
}