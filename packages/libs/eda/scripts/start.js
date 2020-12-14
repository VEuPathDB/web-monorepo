#!/usr/bin/env node

const util = require('util');
const https = require('https');
const querystring = require('querystring');
const setCookie = require('set-cookie-parser');
const childProcess = require('child_process');
const path = require('path');
const read = util.promisify(require('read'));

main();

async function main() {
  const username = await read({ prompt: 'Username: ' });
  const password = await read({ prompt: 'Password: ', silent: true });
  const postData = querystring.stringify({username, password});
  const req = https.request(
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
          const { auth_tkt: authCookie } = setCookie.parse(res, {
            map: true,
            decodeValues: true
          });
          if (authCookie == null) throw new Error("Could not get auth_tkt cookie value.");
          const env = { ...process.env, VEUPATHDB_AUTH_TKT: authCookie.value };
          childProcess.spawn(path.resolve(__dirname, '../node_modules/.bin/react-scripts'), [ 'start' ], {env, stdio: 'inherit'});
        })
        .resume()
    }
  );
  
  req.write(postData);
  req.end();

}
