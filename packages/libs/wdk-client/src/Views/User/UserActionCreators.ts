import { transitionToExternalPage, transitionToInternalPage } from './../../Core/ActionCreators/RouterActionCreators';
import { Action, ActionThunk, EmptyAction, emptyAction } from '../../Utils/ActionCreatorUtils';
import { filterOutProps } from '../../Utils/ComponentUtils';
import { alert, confirm } from '../../Utils/Platform';
import { broadcast } from '../../Utils/StaticDataUtils';
import { RecordInstance } from '../../Utils/WdkModel';
import WdkService from '../../Utils/WdkService';
import { PreferenceScope, User, UserPredicate, UserPreferences, UserWithPrefs } from '../../Utils/WdkUser';
import { State as PasswordStoreState } from '../../Views/User/Password/UserPasswordChangeStoreModule';
import { State as ProfileStoreState, UserProfileFormData } from './Profile/UserProfileReducer';

// actions to update true user and preferences
export type UserUpdateAction = {
  type: "user/user-update",
  payload: {
    user: User;
  }
}
export type PreferenceUpdateAction = {
  type: 'user/preference-update',
  payload: UserPreferences
}
export type PreferencesUpdateAction = {
  type: 'user/preferences-update',
  payload: UserPreferences
}
type PrefAction = PreferenceUpdateAction|PreferencesUpdateAction;

// actions to manage the user profile/registration forms
export type ProfileFormUpdateAction = {
  type: 'user/profile-form-update',
  payload: {
    user: User
  }
}
export type ProfileFormSubmissionStatusAction = {
  type: 'user/profile-form-submission-status',
  payload: {
    formStatus: ProfileStoreState['formStatus'];
    errorMessage: string | undefined;
  }
}

export type ClearRegistrationFormAction = {
  type: 'user/clear-registration-form'
}

// actions to manage user password form
export type PasswordFormUpdateAction = {
  type: 'user/password-form-update',
  payload: PasswordStoreState['passwordForm'];
}
export type PasswordFormSubmissionStatusAction = {
  type: 'user/password-form-submission-status',
  payload: {
    formStatus: PasswordStoreState['formStatus'];
    errorMessage: string | undefined;
  }
}

// actions to manage user password reset form
export type ResetPasswordUpdateEmailAction = {
  type: 'user/reset-password-email-update',
  payload: string
}
export type ResetPasswordSubmissionStatusAction = {
  type: 'user/reset-password-submission-status',
  payload : {
    success: boolean,
    message?: string
  }
}

// actions related to login
export type ShowLoginModalAction = {
  type: 'user/show-login-modal',
  payload: {
    destination: string;
  }
}
export type LoginDismissedAction = {
  type: 'user/login-dismissed'
}
export type LoginErrorAction = {
  type: 'user/login-error',
  payload: {
    message: string;
  }
}

export type LoginRedirectAction = {
  type: 'user/login-redirect',
}
export type LogoutRedirectAction = {
  type: 'user/logout-redirect',
}

// basket actions
export type BasketStatusLoadingAction = {
  type: 'user/basket-status-loading',
  payload: {
    record: RecordInstance
  }
}
export type BasketStatusReceivedAction = {
  type: 'user/basket-status-received',
  payload: {
    record: RecordInstance;
    status: boolean;
  }
}
export type BasketStatusErrorAction = {
  type: 'user/basket-status-error',
  payload: {
    record: RecordInstance,
    error: Error
  }
}

// favorites actions
export type FavoritesStatusLoadingAction = {
  type: 'user/favorites-status-loading',
  payload: { record: RecordInstance }
}
export type FavoritesStatusReceivedAction = {
  type: 'user/favorites-status-received',
  payload: { record: RecordInstance, id?: number }
}
export type FavoritesStatusErrorAction = {
  type: 'user/favorites-status-error',
  payload: { record: RecordInstance, error: Error }
}

/**
 * Fetches the current user.  If the user passes the predicate, transitions to
 * the passed path.  Optional external param lets caller specify if path is
 * internal or external, defaulting to false (internal).
 */
export function conditionallyTransition(test: UserPredicate, path: string, external: boolean = false): ActionThunk<EmptyAction> {
  return function run({ wdkService }) {
    return wdkService.getCurrentUser().then(user => {
      if (test(user)) {
        return external ?
          transitionToExternalPage(path) :
          transitionToInternalPage(path);
      }
      return emptyAction;
    });
  };
}

/**
 * Merge supplied key-value pair with user preferences and update
 * on the server.
 */
export function updateUserPreference(scope: PreferenceScope, key: string, value: string): ActionThunk<PreferenceUpdateAction> {
  return function run({ wdkService }) {
    let updatePromise = wdkService.updateCurrentUserPreference(scope, key, value);
    return sendPrefUpdateOnCompletion(updatePromise,
        'user/preference-update', { [scope]: { [key]: value } } as UserPreferences) as Promise<PreferenceUpdateAction>;
  };
};

export function updateUserPreferences(newPreferences: UserPreferences): ActionThunk<PreferencesUpdateAction> {
  return function run({ wdkService }) {
    let updatePromise = wdkService.updateCurrentUserPreferences(newPreferences);
    return sendPrefUpdateOnCompletion(updatePromise,
        'user/preferences-update', newPreferences) as Promise<PreferencesUpdateAction>;
  };
};

function sendPrefUpdateOnCompletion(
  promise: Promise<UserPreferences>,
  actionName: PreferenceUpdateAction['type']|PreferencesUpdateAction['type'],
  payload: UserPreferences
): Promise<PreferenceUpdateAction|PreferencesUpdateAction> {
    let prefUpdater = function() {
      return broadcast({
        type: actionName,
        payload: payload
      }) as PreferenceUpdateAction|PreferencesUpdateAction;
    };
    return promise.then(
      () => {
        return prefUpdater();
      },
      (error) => {
        console.error(error.response);
        // update stores anyway; not a huge deal if preference doesn't make it to server
        return prefUpdater();
      }
    );
};

function createProfileFormStatusAction(status: string, errorMessage?: string) {
  return createFormStatusAction('user/profile-form-submission-status', status, errorMessage) as ProfileFormSubmissionStatusAction;
}

function createPasswordFormStatusAction(status: string, errorMessage?: string) {
  return createFormStatusAction('user/password-form-submission-status', status, errorMessage) as PasswordFormSubmissionStatusAction;
}

function createFormStatusAction(actionType: string, status: string, errorMessage?: string) {
  return {
    type: actionType,
    payload: {
      formStatus: status,
      errorMessage: errorMessage
    }
  }
}

/** Save user profile to DB */
type SubmitProfileFormType = ActionThunk<UserUpdateAction|PreferencesUpdateAction|ProfileFormSubmissionStatusAction>;
export function submitProfileForm(userProfileFormData: UserProfileFormData): SubmitProfileFormType {
  return function run({ wdkService }) {
    let partialUser: Partial<User> = <UserProfileFormData>filterOutProps(userProfileFormData, ["isGuest", "id", "confirmEmail", "preferences"]);
    let userPromise = wdkService.getCurrentUser().then(user => wdkService.updateCurrentUser({ ...user, ...partialUser }));
    let prefPromise = wdkService.updateCurrentUserPreferences(userProfileFormData.preferences as UserPreferences); // should never be null by this point
    return [
      createProfileFormStatusAction('pending'),
      Promise.all([userPromise, prefPromise]).then(([user]) => [
        // success; update user first, then prefs, then status in ProfileViewStore
        broadcast<UserUpdateAction>({
          type: 'user/user-update',
          // NOTE: this prop name should be the same as that used in StaticDataActionCreator for 'user'
          // NOTE2: not all user props were sent to update but all should remain EXCEPT 'confirmEmail' and 'preferences'
          payload: { user }
        }),
        broadcast<PreferencesUpdateAction>({
          type: 'user/preferences-update',
          payload: userProfileFormData.preferences as UserPreferences
        }),
        createProfileFormStatusAction('success')
      ])
      .catch((error) => {
        console.error(error.response);
        return createProfileFormStatusAction('error', error.response);
      })
    ];
  };
};

/** Register user */
type SubmitRegistrationFormType = ActionThunk<ProfileFormSubmissionStatusAction|ClearRegistrationFormAction>;
export function submitRegistrationForm (formData: UserProfileFormData): SubmitRegistrationFormType {
  return function run({ wdkService }) {
    let trimmedUser = <User>filterOutProps(formData, ["isGuest", "id", "preferences", "confirmEmail"]);
    let registrationData: UserWithPrefs = {
      user: trimmedUser,
      preferences: formData.preferences as UserPreferences
    }
    return [
      createProfileFormStatusAction('pending'),
      wdkService.createNewUser(registrationData).then(responseData => [
        // success; clear the form in case user wants to register another user
        broadcast({ type: 'user/clear-registration-form' }) as ClearRegistrationFormAction,
        // add success message to top of page
        createProfileFormStatusAction('success')
      ])
      .catch((error) => {
        console.error(error.response);
        return createProfileFormStatusAction('error', error.response);
      })
    ];
  };
};

/** Update user profile present in the form (unsaved changes) */
export function updateProfileForm(user: User): ProfileFormUpdateAction {
  return {
    type: 'user/profile-form-update',
    payload: {user}
  }
};

/** Save new password to DB */
export function savePassword(oldPassword: string, newPassword: string): ActionThunk<PasswordFormSubmissionStatusAction> {
  return function run({ wdkService }) {
    return [
      createPasswordFormStatusAction('pending'),
      wdkService.updateCurrentUserPassword(oldPassword, newPassword)
        .then(() => createPasswordFormStatusAction('success'))
        .catch((error) => {
          console.error(error.response);
          return createPasswordFormStatusAction('error', error.response);
        })
      ];
  };
};

/** Update change password form data (unsaved changes) */
export function updateChangePasswordForm(formData: PasswordStoreState['passwordForm']): PasswordFormUpdateAction {
  return {
    type: 'user/password-form-update',
    payload: formData
  }
};

export function updatePasswordResetEmail(emailText: string): ResetPasswordUpdateEmailAction {
  return {
    type: 'user/reset-password-email-update',
    payload: emailText
  };
};

function createResetPasswordStatusAction(message?: string): ResetPasswordSubmissionStatusAction {
  return {
    type: 'user/reset-password-submission-status',
    payload: {
      success: (message ? false : true),
      message: message
    }
  }
};

export function submitPasswordReset(email: string): ActionThunk<ResetPasswordSubmissionStatusAction> {
  return function run({ wdkService, transitioner }) {
    return [
      createResetPasswordStatusAction("Submitting..."),
      wdkService.resetUserPassword(email).then(
          () => {
            // transition to user message page
            transitioner.transitionToInternalPage('/user/message/password-reset-successful');
            // clear form for next visitor to this page
            return createResetPasswordStatusAction(undefined);
          },
          error => {
            return createResetPasswordStatusAction(error.response || error.message);
          }
      )
    ];
  };
};

// Session management action creators and helpers
// ----------------------------------------------

/**
 * Show a warning that user must be logged in for feature
 */
export function showLoginWarning(attemptedAction: string, destination?: string): ActionThunk<EmptyAction|ShowLoginModalAction> {
  return function() {
    return confirm(
      'Login Required',
      'To ' + attemptedAction + ', you must be logged in. Would you like to login now?'
    ).then(confirmed => confirmed ? showLoginForm(destination) : emptyAction);
  }
};

/**
 * Show the login form based on config
 */
export function showLoginForm(destination = window.location.href): ActionThunk<EmptyAction|ShowLoginModalAction> {
  return function({wdkService}) {
    return wdkService.getConfig().then(config => {
      config.authentication.method
      let { oauthClientId, oauthClientUrl, oauthUrl, method } = config.authentication;
      if (method === 'OAUTH2') {
        performOAuthLogin(destination, wdkService, oauthClientId, oauthClientUrl, oauthUrl);
        return emptyAction;
      }
      else { // USER_DB
        return {
          type: 'user/show-login-modal',
          payload: { destination }
        } as ShowLoginModalAction;
      }
    });
  };
};

export function hideLoginForm(): LoginDismissedAction {
  return {
    type: 'user/login-dismissed'
  }
}

export function submitLoginForm(email: string, password: string, destination: string): ActionThunk<EmptyAction|LoginErrorAction> {
  return ({ wdkService }) => {
    return wdkService.tryLogin(email, password, destination)
      .then(response => {
        if (response.success) {
          window.location.assign(response.redirectUrl);
          return emptyAction;
        }
        else {
          return loginErrorReceived(response.message);
        }
      })
      .catch(error => {
        return loginErrorReceived("There was an error submitting your credentials.  Please try again later.");
      });
  };
}

export function loginErrorReceived(message: string): LoginErrorAction {
  return {
    type: 'user/login-error',
    payload: { message }
  }
}

function performOAuthLogin(destination: string, wdkService: WdkService,
  oauthClientId: string, oauthClientUrl: string, oauthUrl: string) {
  wdkService.getOauthStateToken()
    .then((response) => {
      let googleSpecific = (oauthUrl.indexOf("google") != -1);
      let [ redirectUrl, authEndpoint ] = googleSpecific ?
        [ oauthClientUrl + '/login', "auth" ] : // hacks to conform to google OAuth2 API
        [ oauthClientUrl + '/login?redirectUrl=' + encodeURIComponent(destination), "authorize" ];

      let finalOauthUrl = oauthUrl + "/" + authEndpoint + "?" +
        "response_type=code&" +
        "scope=" + encodeURIComponent("openid email") + "&" +
        "state=" + encodeURIComponent(response.oauthStateToken) + "&" +
        "client_id=" + oauthClientId + "&" +
        "redirect_uri=" + encodeURIComponent(redirectUrl);

      window.location.assign(finalOauthUrl);
    })
    .catch(error => {
      alert("Unable to fetch your WDK state token.", "Please check your internet connection.");
      throw error;
    });
}

function logout(): ActionThunk<EmptyAction> {
  return function run({ wdkService }) {
    return wdkService.getConfig().then(config => {
      let { oauthClientId, oauthClientUrl, oauthUrl, method } = config.authentication;
      let logoutUrl = oauthClientUrl + '/logout';
      if (method === 'OAUTH2') {
        let googleSpecific = (oauthUrl.indexOf("google") != -1);
        // don't log user out of google, only the eupath oauth server
        let nextPage = (googleSpecific ? logoutUrl :
          oauthUrl + "/logout?redirect_uri=" + encodeURIComponent(logoutUrl));
        window.location.assign(nextPage);
      }
      else {
        window.location.assign(logoutUrl);
      }
      return emptyAction;
    });
  };
};

export function showLogoutWarning(): ActionThunk<EmptyAction> {
  return function() {
    return confirm(
      'Are you sure you want to logout?',
      'Note: You must log out of other EuPathDB sites separately'
    ).then(confirmed => confirmed ? logout() : emptyAction);
  }
};

const emptyThunk: ActionThunk<EmptyAction> = () => emptyAction;

/**
 * ActionThunk decorator that will branch based on if a user is logged in.
 * If the user is logged in, the first thunk is dispatched, otherwise the
 * second thunk is dispatched (if present).
 */
function maybeLoggedIn<T extends Action>(loggedInThunk: ActionThunk<T>): ActionThunk<T|EmptyAction>;
function maybeLoggedIn<T extends Action, S extends Action>(loggedInThunk: ActionThunk<T>, guestThunk: ActionThunk<S>): ActionThunk<T|S>;
function maybeLoggedIn<T extends Action, S extends Action>(
  loggedInThunk: ActionThunk<T>,
  guestThunk: ActionThunk<S> = emptyThunk as ActionThunk<S>
): ActionThunk<T|S> {
  return ({ wdkService }) =>
    wdkService.getCurrentUser().then(user =>
      user.isGuest ? guestThunk : loggedInThunk
    )
}

//----------------------------------
// Basket action creators and helpers
// ----------------------------------

type BasketAction = BasketStatusLoadingAction | BasketStatusErrorAction | BasketStatusReceivedAction

/**
 * @param {Record} record
 */
export function loadBasketStatus(record: RecordInstance): ActionThunk<BasketAction|EmptyAction> {
  return maybeLoggedIn<BasketAction>(({ wdkService }) =>
    setBasketStatus(record,
      wdkService.getBasketStatus(record.recordClassName, [record]).then(response => response[0]))
  );
};

/**
 * @param {User} user
 * @param {Record} record
 * @param {Boolean} status
 */
export function updateBasketStatus(record: RecordInstance, status: boolean): ActionThunk<BasketAction|ShowLoginModalAction|EmptyAction> {
  return maybeLoggedIn<BasketAction, ShowLoginModalAction|EmptyAction>(
    ({ wdkService }) =>
      setBasketStatus(record,
        wdkService.updateBasketStatus(status, record.recordClassName, [record]).then(response => status)),
    showLoginWarning('use baskets')
  );
};

/**
 * @param {Record} record
 * @param {Promise<boolean>} basketStatusPromise
 */
let setBasketStatus = (record: RecordInstance, basketStatusPromise: Promise<boolean>): ActionThunk<BasketAction> => {
  return function run() {
    return [
      {
        type: 'user/basket-status-loading',
        payload: { record }
      } as BasketAction,
      basketStatusPromise.then(
        status => ({
          type: 'user/basket-status-received',
          payload: { record, status }
        } as BasketAction),
        error => ({
          type: 'user/basket-status-error',
          payload: { record, error }
        } as BasketAction)
      )
    ];
  };
};


// Favorites action creators and helpers
// -------------------------------------

type FavoriteAction = FavoritesStatusErrorAction | FavoritesStatusLoadingAction | FavoritesStatusReceivedAction

/** Create favorites action */
/**
 * @param {Record} record
 */
export function loadFavoritesStatus(record: RecordInstance): ActionThunk<FavoriteAction|EmptyAction> {
  return maybeLoggedIn<FavoriteAction>(
    ({ wdkService }) => setFavoritesStatus(record, wdkService.getFavoriteId(record))
  );
};

export function removeFavorite(record: RecordInstance, favoriteId: number): ActionThunk<FavoriteAction|ShowLoginModalAction|EmptyAction> {
  return maybeLoggedIn<FavoriteAction, ShowLoginModalAction|EmptyAction>(
    ({ wdkService }) => setFavoritesStatus(record, wdkService.deleteFavorite(favoriteId)),
    showLoginWarning('use favorites')
  );
};

export function addFavorite(record: RecordInstance): ActionThunk<FavoriteAction|ShowLoginModalAction|EmptyAction> {
  return maybeLoggedIn<FavoriteAction, ShowLoginModalAction|EmptyAction>(
    ({ wdkService }) => setFavoritesStatus(record, wdkService.addFavorite(record)),
    showLoginWarning('use favorites')
  );
};

/**
 * @param {Record} record
 * @param {Promise<Boolean>} statusPromise
 */
function setFavoritesStatus(record: RecordInstance, statusPromise: Promise<number|undefined>): ActionThunk<FavoriteAction> {
  return function run() {
    return [
      {
        type: 'user/favorites-status-loading',
        payload: { record }
      } as FavoriteAction,
      statusPromise.then(
        id => ({
          type: 'user/favorites-status-received',
          payload: { record, id }
        } as FavoriteAction),
        error => ({
          type: 'user/favorites-status-error',
          payload: { record, error }
        } as FavoriteAction)
      )
    ];
  };
};
