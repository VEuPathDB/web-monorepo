import { useStorageBackedState } from '@veupathdb/wdk-client/lib/Hooks/StorageBackedState';
import {
  arrayOf,
  decodeOrElse,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';

export function useRecentSearches() {
  return useStorageBackedState(
    window.localStorage,
    [],
    'site-search/history',
    JSON.stringify,
    (value) => decodeOrElse(arrayOf(string), [], value)
  );
}
