#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { main as compileMain } from '../scripts/compile.js';
import { main as copyAssetsMain } from '../scripts/copy-assets.js';
import { main as runSiteDevServer } from '../scripts/run-site-dev-server.js';
import { main as start } from '../scripts/start.js';

const script = process.argv[2];

const {
  compile,
  copyAssets
} = configureBuildScripts({
  srcDir: process.argv[3],
  targetDir: process.argv[4]
});

const siteConfigPath = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env')
];

switch(script) {
  case "run-site-dev-server":
    runSiteDevServer({
      siteConfigPath,
      cliArgs: process.argv.slice(3)
    }).catch(handleError);
    break;
  case "start":
    start({
      siteConfigPath
    }).catch(handleError);
    break;
  case "compile":
    compile().catch(handleError);
    break;
  case "copy-assets":
    copyAssets().catch(handleError);
    break;
  case "prepare":
    compile().then(copyAssets).catch(handleError);
    break;
  default:
    spawn('npx', ['react-app-rewired', ...process.argv.slice(2)], { stdio: 'inherit'});
    break;
}

function configureBuildScripts({ srcDir = 'src/lib', targetDir = 'lib' }) {
  return {
    compile: () => compileMain(targetDir),
    copyAssets: () => copyAssetsMain(srcDir, targetDir)
  };
}

function handleError(error) {
  if (error?.message === 'canceled') return;
  console.error(error);
  process.exit(1);
}
