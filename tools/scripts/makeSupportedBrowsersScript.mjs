#!/usr/bin/env node

// Generates a script that can test if a user agent string is "modern" or "legacy"
// This is using the .mjs suffix, so it runs in module mode. This is necessary
// for importing from the browserslist-useragent-regexp package.

import fs from 'fs';
import { getUserAgentRegex } from 'browserslist-useragent-regexp';
const outputFileName = process.argv[2];
const r = getUserAgentRegex({
  env: 'modern',
  allowHigherVersions: true
});
const program = `#!/usr/bin/env node

const path = require('path');
const userAgent = process.argv[2];
if (userAgent == null) {
  process.stderr.write('Missing user agent string.\\nUsage: ' + path.basename(__filename) + ' <userAgentString>\\n');
  process.exit(1);
}
const isModern = ${r}.test(userAgent);
process.stdout.write(isModern ? 'modern/' : 'legacy/');
`;

if (outputFileName) fs.writeFile(outputFileName, program, 'utf8', err => {
  if (err) throw err;
});

else process.stdout.write(program);
