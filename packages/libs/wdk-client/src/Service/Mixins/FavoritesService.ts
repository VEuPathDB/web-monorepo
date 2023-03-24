import { ServiceBase } from '../../Service/ServiceBase';
import { RecordInstance, Favorite, PrimaryKey } from '../../Utils/WdkModel';

export default (base: ServiceBase) => {
  /**
   * Gets favorite ID of a single record, or undefined if record is not a
   * favorite of the current user.  Thus can be used to check whether a record
   * is a favorite of the current user.
   *
   * @param record Record instance to search for
   */
  async function getFavoriteId(
    recordId: PrimaryKey,
    recordClassUrlSegment: string
  ) {
    let data = [
      {
        recordClassName: recordClassUrlSegment,
        primaryKey: recordId,
      },
    ];
    let url = '/users/current/favorites/query';
    return base
      ._fetchJson<Array<number>>('post', url, JSON.stringify(data))
      .then((data) => (data.length ? data[0] : undefined));
  }

  /**
   * Adds the passed record as a favorite of the current user and returns ID
   * of the new favorite.
   *
   * @param record Record to add as a favorite
   */
  async function addFavorite(
    recordId: PrimaryKey,
    recordClassUrlSegment: string
  ) {
    const favorite = {
      recordClassName: recordClassUrlSegment,
      primaryKey: recordId,
    };
    const url = '/users/current/favorites';
    return base
      ._fetchJson<Favorite>('post', url, JSON.stringify(favorite))
      .then((data) => data.id);
  }

  /**
   * Deletes the favorite with the passed ID and returns a promise with the
   * "new ID" i.e. undefined since favorite no longer exists
   *
   * @param id id of favorite to delete
   */
  function deleteFavorite(id: number) {
    let url = '/users/current/favorites/' + id;
    return base._fetchJson<void>('delete', url).then(() => undefined);
  }

  /**
   * Returns an array of the current user's favorites
   */
  function getCurrentFavorites() {
    return base._fetchJson<Favorite[]>('get', '/users/current/favorites');
  }

  /**
   * Saves the note and group on the passed favorite to the server
   *
   * @param favorite
   */
  function saveFavorite(favorite: Favorite) {
    let url = '/users/current/favorites/' + favorite.id;
    favorite.group = favorite.group ? favorite.group : '';
    favorite.description = favorite.description ? favorite.description : '';
    return base._fetchJson<void>('patch', url, JSON.stringify(favorite));
  }

  function deleteFavorites(ids: Array<number>) {
    return runBulkFavoritesAction('delete', ids);
  }

  function undeleteFavorites(ids: Array<number>) {
    return runBulkFavoritesAction('undelete', ids);
  }

  function runBulkFavoritesAction(
    operation: 'delete' | 'undelete',
    ids: Array<number>
  ) {
    let url = '/users/current/favorites';
    let data = { action: operation, primaryKeys: ids };
    return base._fetchJson<void>('patch', url, JSON.stringify(data));
  }

  return {
    getFavoriteId,
    addFavorite,
    deleteFavorite,
    deleteFavorites,
    getCurrentFavorites,
    saveFavorite,
    undeleteFavorites,
  };
};
