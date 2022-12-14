import { spawn } from 'child_process';

import { applyConfig } from '../utils/apply-config.js';
import { checkVEuPathDBAuth } from '../utils/veupathdb-auth.js';

export async function main({
  siteConfigPath,
  cliArgs
}) {
  const authTkt = await checkVEuPathDBAuth(siteConfigPath);
  process.env.VEUPATHDB_AUTH_TKT = authTkt;

  applyConfig(siteConfigPath);

  spawn(
    'npx',
    [
      'webpack',
      'serve',
      '--mode=development',
      ...cliArgs
    ],
    { 
      env: {
        ...process.env,
        VEUPATHDB_AUTH_TKT: authTkt,
      },
      stdio: 'inherit'
    }
  );
}
