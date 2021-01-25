#!/usr/bin/env node
import { spawn } from 'child_process';
import { main as compile } from '../scripts/compile.js';
import { main as copyAssets } from '../scripts/copy-assets.js';
import { main as start } from '../scripts/start.js';

const script = process.argv[2];

switch(script) {
  case "start":
    start().catch(handleError);
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

function handleError(error) {
  if (error?.message === 'canceled') return;
  console.error(error);
  process.exit(1);
}
