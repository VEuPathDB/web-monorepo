import { ServiceBase } from '../../Service/ServiceBase';
import { PreferenceScope, UserPreferences } from '../../Utils/WdkUser';

enum Action {
  Update = 'UPDATE',
}

export default (base: ServiceBase) => {
  let preferences: Promise<UserPreferences> | undefined;

  function getCurrentUserPreferences(): Promise<UserPreferences> {
    if (!preferences) {
      preferences = base._fetchJson<UserPreferences>(
        'get',
        '/users/current/preferences'
      );
    }
    return preferences;
  }

  // update or add a single user preference.  (Set a pref to NULL to clear it).
  function patchSingleUserPreference(
    scope: PreferenceScope,
    key: string,
    value: string | null
  ): Promise<UserPreferences> {
    let update = { action: Action.Update, updates: { [key]: value } };
    let url = `/users/current/preferences/${scope}`;
    let data = JSON.stringify(update);
    return base
      ._fetchJson<void>('patch', url, data)
      .then(() => getCurrentUserPreferences())
      .then((currentPreferences) => {
        // merge with cached preferences only if patch succeeds
        return (preferences = Promise.resolve({
          ...currentPreferences,
          [scope]: {
            ...currentPreferences[scope],
            [key]: value,
          },
        }));
      });
  }

  // update multiple user preferences, for a single scope.  (Set a pref to NULL to clear it).
  function patchScopedUserPreferences(
    scope: PreferenceScope,
    updates: Record<string, string>
  ): Promise<UserPreferences> {
    let update = { action: Action.Update, updates };
    let url = `/users/current/preferences/${scope}`;
    let data = JSON.stringify(update);
    return base
      ._fetchJson<void>('patch', url, data)
      .then(() => getCurrentUserPreferences())
      .then((currentPreferences) => {
        // merge with cached preferences only if patch succeeds
        return (preferences = Promise.resolve({
          ...currentPreferences,
          [scope]: {
            ...currentPreferences[scope],
            ...updates,
          },
        }));
      });
  }

  // patch user both global and project user preferences.  (Set a pref to NULL to clear it)
  async function patchUserPreferences(
    updates: UserPreferences
  ): Promise<UserPreferences> {
    await patchScopedUserPreferences('global', updates.global);
    return await patchScopedUserPreferences('project', updates.project);
  }

  return {
    getCurrentUserPreferences,
    patchSingleUserPreference,
    patchScopedUserPreferences,
    patchUserPreferences,
  };
};
