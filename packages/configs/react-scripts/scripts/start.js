#!/usr/bin/env node

import path from 'path';
import { promisify } from 'util';
import { request } from 'https';
import { stringify } from 'querystring';
import { parse } from 'set-cookie-parser';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import _read from 'read';
const read = promisify(_read);

// Attempt to read variables stored in `.env.local` for VEuPathDB BRC Pre-Release login
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export async function main() {
  const username = process.env.VEUPATHDB_LOGIN_USER ?? await read({ prompt: 'VEuPathDB BRC Pre-Release Username: ' });
  const password = process.env.VEUPATHDB_LOGIN_PASS ?? await read({ prompt: 'VEuPathDB BRC Pre-Release Password: ', silent: true });
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
          spawn('npx', [ 'react-app-rewired', 'start'], {env, stdio: 'inherit'});
        })
        .resume()
    }
  );
  
  req.write(postData);
  req.end();

}
