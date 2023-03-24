import { constant } from 'lodash';
import {
  ActionsObservable,
  combineEpics,
  StateObservable,
} from 'redux-observable';
import { Observable, empty, of } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { Action } from '../Actions';
import { alert, confirm } from '../Utils/Platform';
import { EpicDependencies } from '../Core/Store';

import {
  showLoginWarning,
  showLoginForm,
  showLoginModal,
  navigateToLogin,
  submitLoginForm,
  loginSuccess,
  loginError,
  logoutConfirmed,
  logoutDismissed,
  showLogoutWarning,
} from '../Actions/UserSessionActions';
import { WdkService } from '../Core';
import { RootState } from '../Core/State/Types';

export const key = 'userSession';

export const reduce = constant({});

export const observe = combineEpics(
  observeShowLoginWarning,
  observeShowLoginForm,
  observeSubmitLoginForm,
  observeShowLogoutWarning
);

function observeShowLoginWarning(
  action$: ActionsObservable<Action>
): Observable<Action> {
  return action$.pipe(
    filter(showLoginWarning.isOfType),
    mergeMap(async (action) => {
      const { attemptedAction, destination } = action.payload;
      const shouldLogin = await confirm(
        'Login Required',
        `To ${attemptedAction}, you must be logged in. Would you like to login now?`
      );
      return { shouldLogin, destination };
    }),
    mergeMap(({ shouldLogin, destination }) =>
      shouldLogin ? of(showLoginForm(destination)) : empty()
    )
  );
}

function observeShowLoginForm(
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Observable<Action> {
  return action$.pipe(
    filter(showLoginForm.isOfType),
    mergeMap(async (action) => {
      const { destination = window.location.href } = action.payload;
      const config = await wdkService.getConfig();
      let { oauthClientId, oauthClientUrl, oauthUrl, method } =
        config.authentication;
      if (method === 'OAUTH2' && !usingExternalWebClient(oauthClientUrl)) {
        return performOAuthLogin(
          destination,
          wdkService,
          oauthClientId,
          oauthClientUrl,
          oauthUrl
        );
      } else {
        // USER_DB
        return showLoginModal(destination);
      }
    })
  );
}

function observeSubmitLoginForm(
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Observable<Action> {
  return action$.pipe(
    filter(submitLoginForm.isOfType),
    mergeMap(async (action) => {
      try {
        const { email, password, destination } = action.payload;
        const response = await wdkService.tryLogin(
          email,
          password,
          destination
        );
        if (response.success) {
          window.location.assign(response.redirectUrl);
          return loginSuccess();
        } else {
          return loginError(response.message);
        }
      } catch (error) {
        console.log(error);
        return loginError(
          'There was an error submitting your credentials. Please try again later.'
        );
      }
    })
  );
}

function observeShowLogoutWarning(
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>,
  { paramValueStore, wdkService }: EpicDependencies
): Observable<Action> {
  return action$.pipe(
    filter(showLogoutWarning.isOfType),
    mergeMap(async () => {
      const shouldLogout = await confirm(
        'Are you sure you want to logout?',
        'Note: You must log out of other VEuPathDB sites separately'
      );

      if (!shouldLogout) return logoutDismissed();

      await paramValueStore.clearParamValues();

      const config = await wdkService.getConfig();
      const { oauthClientUrl, oauthUrl, method } = config.authentication;
      const logoutUrl = oauthClientUrl + '/logout';
      if (method === 'OAUTH2') {
        if (usingExternalWebClient(oauthClientUrl)) {
          await wdkService.logout();
          window.location.assign('/');
        } else {
          const googleSpecific = oauthUrl.indexOf('google') != -1;
          // don't log user out of google, only the eupath oauth server
          const nextPage = googleSpecific
            ? logoutUrl
            : oauthUrl +
              '/logout?redirect_uri=' +
              encodeURIComponent(logoutUrl);
          window.location.assign(nextPage);
        }
      } else {
        window.location.assign(logoutUrl);
      }
      return logoutConfirmed();
    })
  );
}

function usingExternalWebClient(oauthClientUrl: string) {
  return new URL(oauthClientUrl).origin !== window.location.origin;
}

async function performOAuthLogin(
  destination: string,
  wdkService: WdkService,
  oauthClientId: string,
  oauthClientUrl: string,
  oauthUrl: string
): Promise<Action> {
  try {
    const response = await wdkService.getOauthStateToken();
    const googleSpecific = oauthUrl.indexOf('google') != -1;
    const [redirectUrl, authEndpoint] = googleSpecific
      ? [oauthClientUrl + '/login', 'auth'] // hacks to conform to google OAuth2 API
      : [
          oauthClientUrl +
            '/login?redirectUrl=' +
            encodeURIComponent(destination),
          'authorize',
        ];

    const finalOauthUrl =
      oauthUrl +
      '/' +
      authEndpoint +
      '?' +
      'response_type=code&' +
      'scope=' +
      encodeURIComponent('openid email') +
      '&' +
      'state=' +
      encodeURIComponent(response.oauthStateToken) +
      '&' +
      'client_id=' +
      oauthClientId +
      '&' +
      'redirect_uri=' +
      encodeURIComponent(redirectUrl);

    window.location.assign(finalOauthUrl);
    return navigateToLogin();
  } catch (error) {
    alert(
      'Unable to fetch your WDK state token.',
      'Please check your internet connection.'
    );
    throw error;
  }
}
