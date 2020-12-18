#!/usr/bin/env node

import { promisify } from 'util';
import { request } from 'https';
import { stringify } from 'querystring';
import { parse } from 'set-cookie-parser';
import { spawn } from 'child_process';
import _read from 'read';
const read = promisify(_read);

// main();

export async function main() {
  process.stdout.write('Enter the VEuPathDB BRC Pre-Release Login credentials\n');
  const username = await read({ prompt: 'Username: ' });
  const password = await read({ prompt: 'Password: ', silent: true });
  const postData = stringify({username, password});
  const req = request(
    'https://veupathdb.org/auth/bin/login',
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': 'auth_probe=1'
      }
    },
    res => {
      res
        .on('end', () => {
          const { auth_tkt: authCookie } = parse(res, {
            map: true,
            decodeValues: true
          });
          if (authCookie == null) throw new Error("Could not get auth_tkt cookie value.");
          const env = { ...process.env, VEUPATHDB_AUTH_TKT: authCookie.value };
          spawn('npx', [ 'react-scripts', 'start'], {env, stdio: 'inherit'});
        })
        .resume()
    }
  );
  
  req.write(postData);
  req.end();

}
