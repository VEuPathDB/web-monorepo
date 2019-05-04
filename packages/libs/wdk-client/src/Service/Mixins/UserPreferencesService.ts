import { ServiceBaseClass } from 'wdk-client/Service/ServiceBase';
import { PreferenceScope, UserPreferences } from 'wdk-client/Utils/WdkUser';

export default (base: ServiceBaseClass) => class UserPreferencesService extends base {

    private _preferences: Promise<UserPreferences> | undefined;

    getCurrentUserPreferences() : Promise<UserPreferences> {
        if (!this._preferences) {
          this._preferences = this._fetchJson<UserPreferences>('get', '/users/current/preferences');
        }
        return this._preferences;
      }
    
      // update or add a single user preference.  (Set a pref to NULL to clear it).
      patchSingleUserPreference(scope: PreferenceScope, key: string, value: string | null): Promise<UserPreferences> {
        let update = { action: 'update', updates: { [key]: value } };
        let url = `/users/current/preferences/${scope}`;
        let data = JSON.stringify(update);
        return this._fetchJson<void>('patch', url, data)
          .then(() => this.getCurrentUserPreferences())
          .then(preferences => {
            // merge with cached preferences only if patch succeeds
            return this._preferences = Promise.resolve({
              ...preferences,
              [scope]: {
                ...preferences[scope],
                [key]: value
              }
            });
          });
      }
      
      // update multiple user preferences, for a single scope.  (Set a pref to NULL to clear it).
      patchScopedUserPreferences(scope: PreferenceScope, updates: Record<string,string>): Promise<UserPreferences> {
        let update = { action: 'update', updates};
        let url = `/users/current/preferences/${scope}`;
        let data = JSON.stringify(update);
        return this._fetchJson<void>('patch', url, data)
          .then(() => this.getCurrentUserPreferences())
          .then(preferences => {
            // merge with cached preferences only if patch succeeds
            return this._preferences = Promise.resolve({
              ...preferences,
              [scope]: {
                ...preferences[scope],
                ...updates
              }
            });
          });
      }
    
      // patch user both global and project user preferences.  (Set a pref to NULL to clear it)
      async patchUserPreferences(updates: UserPreferences) : Promise<UserPreferences> {
        await this.patchScopedUserPreferences('global', updates.global);
        return await this.patchScopedUserPreferences('project', updates.project);
      }
    
}