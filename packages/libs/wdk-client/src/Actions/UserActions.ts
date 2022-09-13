import { Action as ReduxAction } from 'redux';
import { transitionToExternalPage, transitionToInternalPage, Action as RouteAction } from 'wdk-client/Actions/RouterActions';
import { showLoginWarning } from 'wdk-client/Actions/UserSessionActions';
import { ActionThunk, EmptyAction, emptyAction } from 'wdk-client/Core/WdkMiddleware';
import { filterOutProps } from 'wdk-client/Utils/ComponentUtils';
import { RecordInstance } from 'wdk-client/Utils/WdkModel';
import { PreferenceScope, User, UserPredicate, UserPreferences, UserWithPrefs } from 'wdk-client/Utils/WdkUser';
import { UserProfileFormData } from 'wdk-client/StoreModules/UserProfileStoreModule';
import { InferType } from 'prop-types';

export type Action =
  | UserUpdateAction
  | PreferenceUpdateAction
  | PreferencesUpdateAction
  | ProfileFormUpdateAction
  | ProfileFormSubmissionStatusAction
  | ClearRegistrationFormAction
  | PasswordFormUpdateAction
  | PasswordFormSubmissionStatusAction
  | ResetPasswordUpdateEmailAction
  | ResetPasswordSubmissionStatusAction
  | BasketStatusLoadingAction
  | BasketStatusReceivedAction
  | BasketStatusErrorAction
  | FavoritesStatusErrorAction
  | FavoritesStatusReceivedAction
  | FavoritesStatusLoadingAction

type ShowLoginModalAction = InferType<typeof showLoginWarning>;

// actions to update true user and preferences
// -------------------------------------------

//==============================================================================

export const USER_UPDATE = 'user/user-update';

export type UserUpdateAction = {
  type: typeof USER_UPDATE;
  payload: {
    user: User;
  }
}

export function userUpdate(user: User): UserUpdateAction {
  return {
    type: USER_UPDATE,
    payload: {
      user
    }
  }
}

//==============================================================================

export const PREFERENCE_UPDATE = 'user/preference-update';

export type PreferenceUpdateAction = {
  type: typeof PREFERENCE_UPDATE,
  payload: UserPreferences
}

export function preferenceUpdate(preferences: UserPreferences): PreferenceUpdateAction {
  return {
    type: PREFERENCE_UPDATE,
    payload: preferences
  }
}

//==============================================================================

export const PREFERENCES_UPDATE = 'user/preferences-update';

export type PreferencesUpdateAction = {
  type: typeof PREFERENCES_UPDATE,
  payload: UserPreferences
}

export function preferencesUpdate(preferences: UserPreferences): PreferencesUpdateAction {
  return {
    type: PREFERENCES_UPDATE,
    payload: preferences
  }
}


// actions to manage the user profile/registration forms
// -----------------------------------------------------

//==============================================================================

export const PROFILE_FORM_UPDATE = 'user/profile-form-update';

export type ProfileFormUpdateAction = {
  type: typeof PROFILE_FORM_UPDATE,
  payload: {
    userFormContent: UserProfileFormData
  }
}

export function profileFormUpdate(userFormContent: UserProfileFormData): ProfileFormUpdateAction {
  return {
    type: PROFILE_FORM_UPDATE,
    payload: {
      userFormContent
    }
  }
}

//==============================================================================

export const PROFILE_FORM_SUBMISSION_STATUS = 'user/profile-form-submission-status';

export type FormStatus = 'new' | 'modified' | 'pending' | 'success' | 'error';

export type ProfileFormSubmissionStatusAction = {
  type: typeof PROFILE_FORM_SUBMISSION_STATUS,
  payload: {
    formStatus: FormStatus;
    formData: UserProfileFormData;
    errorMessage: string | undefined;
  }
}

export function profileFormSubmissionStatus(formStatus: FormStatus, formData: UserProfileFormData, errorMessage?: string): ProfileFormSubmissionStatusAction {
  return {
    type: PROFILE_FORM_SUBMISSION_STATUS,
    payload: {
      formStatus,
      formData,
      errorMessage
    }
  }
}

//==============================================================================

export const CLEAR_REGISTRATION_FORM = 'user/clear-registration-form';

export type ClearRegistrationFormAction = {
  type: typeof CLEAR_REGISTRATION_FORM;
}

export function clearRegistrationForm(): ClearRegistrationFormAction {
  return {
    type: CLEAR_REGISTRATION_FORM
  }
}


// actions to manage user password form
// ------------------------------------

//==============================================================================

export const PASSWORD_FORM_UPDATE = 'user/password-form-update';

export type PasswordFormUpdateAction = {
  type: typeof PASSWORD_FORM_UPDATE,
  payload: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
}

export function passwordFormUpdate(payload: { oldPassword: string, newPassword: string, confirmPassword: string }): PasswordFormUpdateAction {
  return {
    type: PASSWORD_FORM_UPDATE,
    payload
  };
}

//==============================================================================

export const PASSWORD_FORM_SUBMISSION_STATUS = 'user/password-form-submission-status';

export type PasswordFormSubmissionStatusAction = {
  type: typeof PASSWORD_FORM_SUBMISSION_STATUS,
  payload: {
    formStatus: FormStatus;
    errorMessage: string | undefined;
  }
}

export function passwordFormSubmissionStatus(formStatus: FormStatus, errorMessage?: string): PasswordFormSubmissionStatusAction {
  return {
    type: PASSWORD_FORM_SUBMISSION_STATUS,
    payload: {
      formStatus,
      errorMessage
    }
  }
}


// actions to manage user password reset form
// ------------------------------------------

//==============================================================================

export const RESET_PASSWORD_UPDATE_EMAIL = 'user/reset-password-email-update';

export type ResetPasswordUpdateEmailAction = {
  type: typeof RESET_PASSWORD_UPDATE_EMAIL,
  payload: string
}

export function resetPasswordUpdateEmail(email: string): ResetPasswordUpdateEmailAction {
  return {
    type: RESET_PASSWORD_UPDATE_EMAIL,
    payload: email
  }
}

//==============================================================================

export const RESET_PASSWORD_SUBMISSION_STATUS = 'user/reset-password-submission-status';

export type ResetPasswordSubmissionStatusAction = {
  type: typeof RESET_PASSWORD_SUBMISSION_STATUS,
  payload : {
    success: boolean,
    message?: string
  }
}

export function resetPasswordSubmissionStatus(message?: string): ResetPasswordSubmissionStatusAction {
  return {
    type: RESET_PASSWORD_SUBMISSION_STATUS,
    payload: {
      success: message == null,
      message
    }
  }
}


// basket actions
// --------------

//==============================================================================

export const BASKET_STATUS_LOADING = 'user/basket-status-loading';

export type BasketStatusLoadingAction = {
  type: typeof BASKET_STATUS_LOADING,
  payload: {
    record: RecordInstance
  }
}

export function basketStatusLoading(record: RecordInstance): BasketStatusLoadingAction {
  return {
    type: BASKET_STATUS_LOADING,
    payload: {
      record
    }
  }
}

//==============================================================================

export const BASKET_STATUS_RECEIVED = 'user/basket-status/received';

export type BasketStatusReceivedAction = {
  type: typeof BASKET_STATUS_RECEIVED,
  payload: {
    record: RecordInstance;
    status: boolean;
  }
}

export function basketStatusReceived(record: RecordInstance, status: boolean): BasketStatusReceivedAction {
  return {
    type: BASKET_STATUS_RECEIVED,
    payload: {
      record,
      status
    }
  }
}

//==============================================================================

export const BASKET_STATUS_ERROR = 'user/basket-status-error';

export type BasketStatusErrorAction = {
  type: typeof BASKET_STATUS_ERROR,
  payload: {
    record: RecordInstance,
    error: Error
  }
}

export function basketStatusError(record: RecordInstance, error: Error): BasketStatusErrorAction {
  return {
    type: BASKET_STATUS_ERROR,
    payload: {
      record,
      error
    }
  }
}


// favorites actions
// -----------------

//==============================================================================

export const FAVORITES_STATUS_LOADING = 'user/favorites-status-loading';

export type FavoritesStatusLoadingAction = {
  type: typeof FAVORITES_STATUS_LOADING,
  payload: { record: RecordInstance }
}

export function favoritesStatusLoading(record: RecordInstance): FavoritesStatusLoadingAction {
  return {
    type: FAVORITES_STATUS_LOADING,
    payload: {
      record
    }
  }
}

//==============================================================================

export const FAVORITES_STATUS_RECEIVED = 'user/favorites-status-received';

export type FavoritesStatusReceivedAction = {
  type: typeof FAVORITES_STATUS_RECEIVED,
  payload: { record: RecordInstance, id?: number }
}

export function favoritesStatusReceived(record: RecordInstance, id?: number): FavoritesStatusReceivedAction {
  return {
    type: FAVORITES_STATUS_RECEIVED,
    payload: {
      record,
      id
    }
  }
}

//==============================================================================

export const FAVORITES_STATUS_ERROR = 'user/favorites-status-error';

export type FavoritesStatusErrorAction = {
  type: typeof FAVORITES_STATUS_ERROR;
  payload: { record: RecordInstance, error: Error }
}

export function favoritesStatusError(record: RecordInstance, error: Error): FavoritesStatusErrorAction {
  return {
    type: FAVORITES_STATUS_ERROR,
    payload: {
      record,
      error
    }
  }
}

//==============================================================================


/**
 * Fetches the current user.  If the user passes the predicate, transitions to
 * the passed path.  Optional external param lets caller specify if path is
 * internal or external, defaulting to false (internal).
 */
export function conditionallyTransition(test: UserPredicate, path: string, external: boolean = false): ActionThunk<EmptyAction | RouteAction> {
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
    let updatePromise = wdkService.patchSingleUserPreference(scope, key, value);
    return sendPrefUpdateOnCompletion(updatePromise, preferenceUpdate({ [scope]: { [key]: value }} as UserPreferences))
  };
};

export function updateUserPreferences(newPreferences: UserPreferences): ActionThunk<PreferencesUpdateAction> {
  return function run({ wdkService }) {
    let updatePromise = wdkService.patchUserPreferences(newPreferences);
    return sendPrefUpdateOnCompletion(updatePromise, preferencesUpdate(newPreferences));
  };
};

function sendPrefUpdateOnCompletion<PrefAction extends PreferenceUpdateAction | PreferencesUpdateAction> (
  promise: Promise<UserPreferences>,
  action: PrefAction
): Promise<PrefAction> {
    let prefUpdater = function() {
      return action;
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

/** Save user profile to DB */
type SubmitProfileFormType = ActionThunk<UserUpdateAction|PreferencesUpdateAction|ProfileFormSubmissionStatusAction>;
export function submitProfileForm(formData: UserProfileFormData): SubmitProfileFormType {
  return function run({ wdkService }) {
    let partialUser: Partial<User> = <UserProfileFormData>filterOutProps(formData, ["isGuest", "id", "confirmEmail", "preferences"]);
    let userPromise = wdkService.getCurrentUser().then(user => wdkService.updateCurrentUser({ ...user, ...partialUser }));
    return [
      profileFormSubmissionStatus('pending', formData),
      // Need to delay the preferences update until a .then() here rather than request in parallel and
      // use Promise.all() because updateCurrentUser() has the potential to reset the WDK user cookie.
      // If we make another request after updateCurrentUser() is called but before it returns, the
      // second request will log the user out (depending on race condition status).
      userPromise.then(user => [
        wdkService.patchUserPreferences(formData.preferences as UserPreferences).then(prefPromise => [
          // success; update user first, then prefs, then status in ProfileViewStore
          // NOTE: this prop name should be the same as that used in StaticDataActionCreator for 'user'
          // NOTE2: not all user props were sent to update but all should remain EXCEPT 'confirmEmail' and 'preferences'
          userUpdate(user),
          preferencesUpdate(formData.preferences as UserPreferences),
          profileFormSubmissionStatus('success', formData)
        ])
      ])
      .catch((error) => {
        let message = (error.status >= 400 && error.status !== 422 ? error.response :
          // happen to know that 422s will have a general validation error message
          JSON.parse(error.response).errors.general[0]);
        console.error(message);
        return profileFormSubmissionStatus('error', formData, message);
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
      profileFormSubmissionStatus('pending', formData),
      wdkService.createNewUser(registrationData).then(responseData => [
        // success; clear the form in case user wants to register another user
        clearRegistrationForm(),
        // add success message to top of page
        profileFormSubmissionStatus('success', formData)
      ])
      .catch((error) => {
        let message = (error.status >= 500 ? error.response :
          // happen to know that 400s will have a general validation error message
          JSON.parse(error.response).errors.general[0]);
        console.error(message);
        return profileFormSubmissionStatus('error', formData, message);
      })
    ];
  };
};

/** Save new password to DB */
export function savePassword(oldPassword: string, newPassword: string): ActionThunk<PasswordFormSubmissionStatusAction> {
  return function run({ wdkService }) {
    return [
      passwordFormSubmissionStatus('pending'),
      wdkService.updateCurrentUserPassword(oldPassword, newPassword)
        .then(() => passwordFormSubmissionStatus('success'))
        .catch((error) => {
          console.error(error.response);
          return passwordFormSubmissionStatus('error', error.response);
        })
      ];
  };
};

export function submitPasswordReset(email: string): ActionThunk<ResetPasswordSubmissionStatusAction> {
  return function run({ wdkService, transitioner }) {
    return [
      resetPasswordSubmissionStatus("Submitting..."),
      wdkService.resetUserPassword(email).then(
          () => {
            // transition to user message page
            transitioner.transitionToInternalPage('/user/message/password-reset-successful');
            // clear form for next visitor to this page
            return resetPasswordSubmissionStatus(undefined);
          },
          error => {
            return resetPasswordSubmissionStatus(error.response || error.message);
          }
      )
    ];
  };
};

const emptyThunk: ActionThunk<EmptyAction> = () => emptyAction;

/**
 * ActionThunk decorator that will branch based on if a user is logged in.
 * If the user is logged in, the first thunk is dispatched, otherwise the
 * second thunk is dispatched (if present).
 */
function maybeLoggedIn<T extends ReduxAction>(loggedInThunk: ActionThunk<T>): ActionThunk<T|EmptyAction>;
function maybeLoggedIn<T extends ReduxAction, S extends ReduxAction>(loggedInThunk: ActionThunk<T>, guestThunk: ActionThunk<S>): ActionThunk<T|S>;
function maybeLoggedIn<T extends ReduxAction, S extends ReduxAction>(
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

// TODO Remove these actions and use ./BasketActions.ts

type BasketAction = BasketStatusLoadingAction | BasketStatusErrorAction | BasketStatusReceivedAction

/**
 * @param {Record} record
 */
export function loadBasketStatus(record: RecordInstance, recordClassUrlSegment: string): ActionThunk<BasketAction|EmptyAction> {
  return maybeLoggedIn<BasketAction>(async ({ wdkService }) =>
    setBasketStatus(record, wdkService.getBasketStatus(
      recordClassUrlSegment,
      [record]
    ).then(response => response[0]))
  );
};

/**
 * @param {User} user
 * @param {Record} record
 * @param {Boolean} status
 */
export function updateBasketStatus(record: RecordInstance, recordClassUrlSegment: string, status: boolean): ActionThunk<BasketAction|ShowLoginModalAction|EmptyAction> {
  return maybeLoggedIn<BasketAction, ShowLoginModalAction|EmptyAction>(
    async ({ wdkService }) =>
      setBasketStatus(record,
        wdkService.updateRecordsBasketStatus(
          status ? 'add' : 'remove',
          recordClassUrlSegment,
          [record.id]
        ).then(() => status)),
    () => showLoginWarning('use baskets')
  );
};

/**
 * @param {Record} record
 * @param {Promise<boolean>} basketStatusPromise
 */
let setBasketStatus = (record: RecordInstance, basketStatusPromise: Promise<boolean>): ActionThunk<BasketAction> => {
  return function run() {
    return [
      basketStatusLoading(record),
      basketStatusPromise.then(
        status => basketStatusReceived(record, status),
        error => basketStatusError(record, error)
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
export function loadFavoritesStatus(record: RecordInstance, recordClassUrlSegment: string): ActionThunk<FavoriteAction|EmptyAction> {
  return maybeLoggedIn<FavoriteAction>(
    ({ wdkService }) => setFavoritesStatus(record, wdkService.getFavoriteId(record.id, recordClassUrlSegment))
  );
};

export function removeFavorite(record: RecordInstance, favoriteId: number): ActionThunk<FavoriteAction|ShowLoginModalAction|EmptyAction> {
  return maybeLoggedIn<FavoriteAction, ShowLoginModalAction|EmptyAction>(
    ({ wdkService }) => setFavoritesStatus(record, wdkService.deleteFavorite(favoriteId)),
    () => showLoginWarning('use favorites')
  );
};

export function addFavorite(record: RecordInstance, recordClassUrlSegment: string): ActionThunk<FavoriteAction|ShowLoginModalAction|EmptyAction> {
  return maybeLoggedIn<FavoriteAction, ShowLoginModalAction|EmptyAction>(
    ({ wdkService }) => setFavoritesStatus(record, wdkService.addFavorite(record.id, recordClassUrlSegment)),
    () => showLoginWarning('use favorites')
  );
};

/**
 * @param {Record} record
 * @param {Promise<Boolean>} statusPromise
 */
function setFavoritesStatus(record: RecordInstance, statusPromise: Promise<number|undefined>): ActionThunk<FavoriteAction> {
  return function run() {
    return [
      favoritesStatusLoading(record),
      statusPromise.then(
        id => favoritesStatusReceived(record, id),
        error => favoritesStatusError(record, error)
      )
    ];
  };
};
