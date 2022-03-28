import { spawn } from 'child_process';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

import { checkVEuPathDBAuth } from '../utils/veupathdb-auth.js';

export async function main({
  siteConfigPath,
  cliArgs
}) {
  const authTkt = await checkVEuPathDBAuth(siteConfigPath);
  process.env.VEUPATHDB_AUTH_TKT = authTkt;

  const devEnv = dotenv.config({ path: siteConfigPath });
  dotenvExpand(devEnv);

  spawn(
    'npx',
    [
      'yarn',
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
