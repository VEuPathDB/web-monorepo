import fs from 'fs-extra';

export function main() {
  return fs.copy('src/lib', 'lib', {
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
