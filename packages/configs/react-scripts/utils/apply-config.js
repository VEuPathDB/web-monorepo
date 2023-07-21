import { existsSync } from 'fs';

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

export function applyConfig(siteConfigPath) {
  const dotenvFilesToApply = !Array.isArray(siteConfigPath)
    ? [siteConfigPath]
    : siteConfigPath;

  dotenvFilesToApply.forEach((dotenvFilename) => {
    if (existsSync(dotenvFilename)) {
      const nextEnv = dotenv.config({ path: dotenvFilename });
      dotenvExpand(nextEnv);
    }
  });
}
