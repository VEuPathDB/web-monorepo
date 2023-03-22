#!/usr/bin/env node

import { spawn } from 'child_process';

import { checkVEuPathDBAuth } from '../utils/veupathdb-auth.js';

export async function main({ siteConfigPath }) {
  const authCookie = await checkVEuPathDBAuth(siteConfigPath);

  const env = { ...process.env, VEUPATHDB_AUTH_TKT: authCookie };

  spawn('npx', [ 'react-app-rewired', 'start' ], { env, stdio: 'inherit' });

}
