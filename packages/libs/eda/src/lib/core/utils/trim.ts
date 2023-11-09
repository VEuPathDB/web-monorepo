import { dropRightWhile, dropWhile } from 'lodash';

/**
 * Something that should be in lodash!  Oh, it nearly is.
 *
 * Trim an array from the start and end, removing elements for which the filter function returns true
 *
 * Unused as of 2023-10-20
 */
export function trimArray<T>(array: Array<T>, filter: (val: T) => boolean) {
  return dropRightWhile(dropWhile(array, filter), filter);
}
