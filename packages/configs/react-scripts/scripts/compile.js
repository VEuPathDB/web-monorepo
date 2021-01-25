import { spawn } from 'child_process';
import { rm } from 'fs/promises';

export async function main() {
  await cleanCompilationDirectory();
  await executeCompilationProcess();
}

function cleanCompilationDirectory() {
  return rm(
    'lib',
    { recursive: true, force: true }
  );
}

function executeCompilationProcess() {
  return new Promise(function (resolve, reject) {
    const compilationProcess = spawn(
      'npx',
      [
        'tsc',
        '--project', './tsconfig.build.json'
      ],
      { stdio: 'inherit' }
    );

    compilationProcess.on('exit', function (code) {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Compilation process terminated with non-zero error code ${code}.`));
      }
    });

    compilationProcess.on('error', reject);
  });
}
