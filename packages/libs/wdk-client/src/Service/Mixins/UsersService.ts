import { ServiceBaseClass } from 'wdk-client/Service/ServiceBase';
import { User, UserWithPrefs } from 'wdk-client/Utils/WdkUser';

export default (base: ServiceBaseClass) => class UsersService extends base {
    private _currentUserPromise: Promise<User> | undefined;

    getCurrentUser() {
        if (this._currentUserPromise == null) {
          this._currentUserPromise = this._fetchJson<User>('get', '/users/current');
        }
        return this._currentUserPromise;
      }
    
      createNewUser(userWithPrefs: UserWithPrefs) {
        return this._fetchJson<User>('post', '/users', JSON.stringify(userWithPrefs));
      }
    
      updateCurrentUser(user: User) {
        let url = '/users/current';
        let data = JSON.stringify(user);
        return this._currentUserPromise = this._fetchJson<void>('put', url, data).then(() => user);
      }
    
      updateCurrentUserPassword(oldPassword: string, newPassword: string) {
        let url = '/users/current/password';
        let data = JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword });
        return this._fetchJson<void>('put', url, data);
      }
    
      resetUserPassword(email: string) {
        let url = '/user-password-reset';
        let data = JSON.stringify({ email });
        return this._fetchJson<void>('post', url, data);
      }
    
    
}