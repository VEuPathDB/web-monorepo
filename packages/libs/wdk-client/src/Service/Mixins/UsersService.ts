import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { User, UserWithPrefs } from 'wdk-client/Utils/WdkUser';
import { Identifier } from 'wdk-client/Utils/WdkModel';

export default (base: ServiceBase) => {
  let currentUserPromise: Promise<User> | undefined;

  function getCurrentUser(options: { force?: boolean } = {}) {
    if (options.force || currentUserPromise == null) {
      currentUserPromise = base._fetchJson<User>('get', '/users/current');
    }
    return currentUserPromise;
  }

  function createNewUser(userWithPrefs: UserWithPrefs) {
    return base._fetchJson<Identifier>('post', '/users', JSON.stringify(userWithPrefs));
  }

  function updateCurrentUser(user: User) {
    let url = '/users/current';
    let data = JSON.stringify(user);
    return base._fetchJson<void>('put', url, data)
      .then(() => currentUserPromise = Promise.resolve(user));
  }

  function updateCurrentUserPassword(oldPassword: string, newPassword: string) {
    let url = '/users/current/password';
    let data = JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword });
    return base._fetchJson<void>('put', url, data);
  }

  function resetUserPassword(email: string) {
    let url = '/user-password-reset';
    let data = JSON.stringify({ email });
    return base._fetchJson<void>('post', url, data);
  }

  return {
    getCurrentUser,
    createNewUser,
    updateCurrentUser,
    updateCurrentUserPassword,
    resetUserPassword
  }

}
