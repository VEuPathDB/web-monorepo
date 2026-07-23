import { PartialDatasetPublication as Publication } from '../../../../../../Service/Model';
import { Consumer } from '../../../../../../Utils';
import { UnaryFunction } from '../../../../../../Utils/types';

export type PublicationList = readonly Publication[];

export type PublicationSetter = Consumer<UnaryFunction<Publication>>;

/**
 * Ensure there is exactly one primary publication in the given array of
 * publications.
 *
 * Uses the `isPrimary` value of the publication at the given `index` to
 * determine which publication in the given array should be made primary.  If
 * the publication at the given index is marked as primary, then all other
 * publications will be set to non-primary.  If the publication at the given
 * index is set to non-primary, then the publication at index `0` will be set
 * to primary.
 *
 * @param pubs Publications
 *
 * @param index Index of the updated publication whose `isPrimary` value should
 * be checked.
 */
export function fixPrimaries(
  pubs: PublicationList,
  index: number
): PublicationList {
  if (pubs.length === 1) {
    return [{ ...pubs[0], isPrimary: true }];
  }

  let primaryIndex = index;

  // If the current target is being set as _not_ primary, ensure there is
  // another entry that _is_ primary.
  //
  // If no other entries are marked as primary, set entry 0 to primary, even if
  // that is the one the user just unchecked.
  if (!pubs[index].isPrimary) {
    primaryIndex = Math.max(
      0,
      pubs.findIndex((it) => it.isPrimary)
    );
  }

  return pubs.map((it, i) => ({ ...it, isPrimary: i === primaryIndex }));
}

const DEBOUNCE_DELAY_MILLIS = 666;

let publicationDebounceTimer = -1;
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  ...args: Parameters<T>
) {
  if (publicationDebounceTimer > 0)
    window.clearTimeout(publicationDebounceTimer);

  publicationDebounceTimer = window.setTimeout(
    fn,
    DEBOUNCE_DELAY_MILLIS,
    ...args
  );
}
