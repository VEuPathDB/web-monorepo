import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';

export const showLoginWarning = makeActionCreator(
  'user-session/show-login-warning',
  (attemptedAction: string, destination?: string) => ({
    attemptedAction,
    destination,
  })
);

export const showLoginForm = makeActionCreator(
  'user-session/show-login-form',
  (destination?: string) => ({ destination })
);

export const showLoginModal = makeActionCreator(
  'user-session/show-login-modal',
  (destination?: string) => ({ destination })
);

export const hideLoginModal = makeActionCreator(
  'user-session/hide-login-modal'
);

export const submitLoginForm = makeActionCreator(
  'user-session/submit-login-form',
  (email: string, password: string, destination: string) => ({
    email,
    password,
    destination,
  })
);

export const loginSuccess = makeActionCreator('user-session/login-success');

export const loginError = makeActionCreator(
  'user-session/login-error',
  (message: string) => ({ message })
);

export const navigateToLogin = makeActionCreator(
  'user-session/navigate-to-login'
);

export const showLogoutWarning = makeActionCreator(
  'user-session/show-logout-warning'
);

export const logoutConfirmed = makeActionCreator(
  'user-session/logout-confirmed'
);

export const logoutDismissed = makeActionCreator(
  'user-session/logout-dismissed'
);

export type Action =
  | InferAction<typeof showLoginWarning>
  | InferAction<typeof showLoginForm>
  | InferAction<typeof showLoginModal>
  | InferAction<typeof hideLoginModal>
  | InferAction<typeof submitLoginForm>
  | InferAction<typeof showLogoutWarning>
  | InferAction<typeof logoutConfirmed>
  | InferAction<typeof logoutDismissed>
  | InferAction<typeof navigateToLogin>
  | InferAction<typeof loginSuccess>
  | InferAction<typeof loginError>;
