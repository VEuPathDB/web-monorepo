import { ServiceBaseClass } from 'wdk-client/Service/ServiceBase';
import {
    RecordInstance,
    Favorite,
} from 'wdk-client/Utils/WdkModel';


export default (base: ServiceBaseClass) => class FavoritesService extends base {

      /**
   * Gets favorite ID of a single record, or undefined if record is not a
   * favorite of the current user.  Thus can be used to check whether a record
   * is a favorite of the current user.
   *
   * @param record Record instance to search for
   */
  getFavoriteId (record: RecordInstance) {
    let data = [{
      recordClassName: record.recordClassName,
      primaryKey: record.id
    }];
    let url = '/users/current/favorites/query';
    return this
      ._fetchJson<Array<number>>('post', url, JSON.stringify(data))
      .then(data => data.length ? data[0] : undefined);
  }

/**
 * Adds the passed record as a favorite of the current user and returns ID
 * of the new favorite.
 *
 * @param record Record to add as a favorite
 */
addFavorite (record: RecordInstance) {
  const { recordClassName, id } = record;
  const favorite = { recordClassName, primaryKey: id };
  const url = '/users/current/favorites';
  return this
    ._fetchJson<Favorite>('post', url, JSON.stringify(favorite))
    .then(data => data.id);
}

/**
 * Deletes the favorite with the passed ID and returns a promise with the
 * "new ID" i.e. undefined since favorite no longer exists
 *
 * @param id id of favorite to delete
 */
deleteFavorite (id: number) {
  let url = '/users/current/favorites/' + id;
  return this
    ._fetchJson<void>('delete', url)
    .then(() => undefined);
}

/**
 * Returns an array of the current user's favorites
 */
getCurrentFavorites () {
  return this._fetchJson<Favorite[]>('get', '/users/current/favorites');
}

/**
 * Saves the note and group on the passed favorite to the server
 *
 * @param favorite
 */
saveFavorite (favorite: Favorite) {
  let url = '/users/current/favorites/' + favorite.id;
  favorite.group = favorite.group ? favorite.group : '';
  favorite.description = favorite.description ? favorite.description : '';
  return this._fetchJson<void>('put', url, JSON.stringify(favorite));
}

deleteFavorites (ids: Array<number>) {
  return this.runBulkFavoritesAction('delete', ids);
}

undeleteFavorites (ids: Array<number>) {
  return this.runBulkFavoritesAction('undelete', ids);
}

private runBulkFavoritesAction (operation: string, ids: Array<number>) {
  let url = '/users/current/favorites';
  let base = { delete: [], undelete: [] };
  let data = Object.assign({}, base, { [operation]: ids });
  return this._fetchJson<void>('patch', url, JSON.stringify(data));
}

}