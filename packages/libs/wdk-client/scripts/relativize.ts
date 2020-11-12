import * as path from 'path';
import * as shell from 'shelljs';

const [ workingDir, alias ] = process.argv.slice(2);
const usage = "Usage: relativize <workingDir> <alias>";

if (!workingDir || !alias) {
  console.error(usage);
  process.exit(1);
}

shell.cd(workingDir);
shell.find('*')
  .filter(file => shell.test('-f', file))
  .forEach(file => {
    const relPart = path.dirname(file.replace(/[^\/]*\//g, '../'));
    shell.sed('-i', alias, relPart, file);
  })
