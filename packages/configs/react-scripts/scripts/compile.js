import { spawn } from 'child_process';
import { rm } from 'fs/promises';

// TODO: Break cleanCompilationDirectory off
// into its own react-script (as in @veupathdb/wdk-client)
export async function main(targetDir) {
  await cleanCompilationDirectory(targetDir);
  await executeCompilationProcess();
}

function cleanCompilationDirectory(targetDir) {
  return rm(
    targetDir,
    { recursive: true, force: true }
  );
}

function executeCompilationProcess() {
  return new Promise(function(resolve, reject) {
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
