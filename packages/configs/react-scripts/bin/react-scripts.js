#!/usr/bin/env node
import { spawn } from 'child_process';
import { main } from '../scripts/start.js';

const script = process.argv[2];

switch(script) {
  case "start":
    main().catch(error => {
      if (error.message === 'canceled') return;
      console.error(error);
    });
    break;
  default:
    spawn('npx', ['react-app-rewired', ...process.argv.slice(2)], { stdio: 'inherit'});
    break;
}
