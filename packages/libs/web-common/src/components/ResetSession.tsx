import React, { useState } from 'react';

import {
  useWdkDependenciesEffect,
  WdkDependencies,
} from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { alert } from '@veupathdb/wdk-client/lib/Utils/Platform';

import './ResetSession.scss';

const cx = makeClassNameHelper('ebrc-ResetSession');

export function ResetSession() {
  const [confirmed, setConfirmed] = useState(false);
  const [isResetSessionClicked, setIsResetSessionClicked] = useState(false);

  useWdkDependenciesEffect(
    (wdkDependencies) => {
      (async function () {
        if (isResetSessionClicked) {
          await resetSession(wdkDependencies);
          await alert(
            'Your session has been reset',
            'You will now be redirected to the home page.'
          );
          window.location.href = '/';
        }
      })();
    },
    [isResetSessionClicked]
  );

  return (
    <div className={cx()}>
      <h1>Reset Session</h1>
      <div className={cx('--Content')}>
        <p>
          Clicking the following button will remove all cookies related to this
          website and redirect you to the homepage.
        </p>

        <p>This means the following things will happen:</p>

        <ul>
          <li>If you are logged in, you will be logged out.</li>
          <li>
            If you are not logged in, any unsaved worked will be gone forever.
          </li>
        </ul>

        <div className={cx('--Confirmation')}>
          <input
            checked={confirmed}
            onChange={() => setConfirmed(!confirmed)}
            type="checkbox"
            id="understand-reset"
          />
          <label htmlFor="understand-reset">
            I understand that I may lose work.
          </label>
          <button
            id="reset"
            disabled={!confirmed || isResetSessionClicked}
            onClick={() => setIsResetSessionClicked(true)}
          >
            Reset session
          </button>
        </div>
      </div>
    </div>
  );
}

function resetSession({ paramValueStore, wdkService }: WdkDependencies) {
  deleteCookies('/');
  deleteCookies('/cgi-bin/');

  if (window.sessionStorage) {
    window.sessionStorage.clear();
  }

  if (window.localStorage) {
    window.localStorage.clear();
  }

  return Promise.all([
    paramValueStore.clearParamValues(),
    wdkService._clearCache(),
  ]);
}

function deleteCookies(path: string) {
  document.cookie.split(/\s*;\s*/).forEach(function (cookie) {
    var eqPos = cookie.indexOf('=');
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    var cookieValue = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';

    if (path) {
      cookieValue += ';path=' + path;
    }

    document.cookie = cookieValue;
  });
}
