import fs from 'fs-extra';

export function main(srcDir, targetDir) {
  return fs.copy(srcDir, targetDir, {
    filter: src => {
      if (fs.lstatSync(src).isDirectory()) {
        return true;
      }

      return (
        !src.endsWith('.js') &&
        !src.endsWith('.jsx') &&
        !src.endsWith('.ts') &&
        !src.endsWith('.tsx') &&
        !src.toLowerCase().endsWith('md')
      );
    }
  });
}
