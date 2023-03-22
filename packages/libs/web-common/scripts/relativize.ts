import * as path from 'path';
import * as shell from 'shelljs';

const [ workingDir, alias ] = process.argv.slice(2);
const usage = "Usage: relativize <workingDir> <alias>";

if (!workingDir || !alias) {
  console.error(usage);
  process.exit(1);
}

const imageRe = /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/i;

shell.cd(workingDir);
shell.find('*')
  .filter(file => shell.test('-f', file) && !imageRe.test(file))
  .forEach(file => {
    const relPart = path.dirname(file.replace(/[^\/]*\//g, '../'));
    shell.sed('-i', alias, relPart, file);
  })
