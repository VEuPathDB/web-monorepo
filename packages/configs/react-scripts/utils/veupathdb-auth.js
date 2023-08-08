import { promisify } from 'util';
import { request } from 'https';
import { stringify } from 'querystring';
import { parse } from 'set-cookie-parser';
import _read from 'read';

import { applyConfig } from './apply-config.js';

const read = promisify(_read);

export const checkVEuPathDBAuth = promisify(async function (
  siteConfigPath,
  callback
) {
  applyConfig(siteConfigPath);

  const username =
    process.env.VEUPATHDB_LOGIN_USER ??
    (await read({ prompt: 'VEuPathDB BRC Pre-Release Username: ' }));
  const password =
    process.env.VEUPATHDB_LOGIN_PASS ??
    (await read({
      prompt: 'VEuPathDB BRC Pre-Release Password: ',
      silent: true,
    }));
  const postData = stringify({ username, password });
  const req = request(
    'https://veupathdb.org/auth/bin/login',
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        Cookie: 'auth_probe=1',
      },
    },
    (res) => {
      res
        .on('end', () => {
          const { auth_tkt: authCookie } = parse(res, {
            map: true,
            decodeValues: true,
          });
          if (authCookie == null) {
            callback(new Error('Could not get auth_tkt cookie value.'), null);
          } else {
            callback(null, authCookie.value);
          }
        })
        .resume();
    }
  );

  req.write(postData);
  req.end();
});
