#!/usr/bin/env node

const fs = require('fs');
const { getUserAgentRegExp } = require('browserslist-useragent-regexp');
const outputFileName = process.argv[2];
const r = getUserAgentRegExp({
  env: 'modern',
  allowHigherVersions: true
});
const program = `#!/opt/node/bin/node

const path = require('path');
const userAgent = process.argv[2];
if (userAgent == null) {
  process.stderr.write('Missing user agent string.\\nUsage: ' + path.basename(__filename) + ' <userAgentString>\\n');
  process.exit(1);
}
const isModern = ${r}.test(userAgent);
process.stdout.write(isModern ? 'modern' : 'legacy');
`;

if (outputFileName) fs.writeFile(outputFileName, program, 'utf8', err => {
  if (err) throw err;
});

else process.stdout.write(program);