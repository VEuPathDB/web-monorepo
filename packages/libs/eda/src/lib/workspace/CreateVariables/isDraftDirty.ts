import { isEqual } from 'lodash';
import { FilterDefinedGroupsSpec } from '../../core/derivedVariables/types';

/**
 * Whether a variable draft differs from the spec the editor opened with,
 * looking only at what "Save variable" writes: the name (trimmed), the entity,
 * the groups (in order, by label and filters), and "Everything else".
 *
 * Filter-widget display settings are not compared. "Everything else" is
 * compared only once the user has touched it: until then it follows the groups
 * automatically, which is not a user edit.
 */
export function isDraftDirty(
  opening: FilterDefinedGroupsSpec,
  draft: FilterDefinedGroupsSpec,
  everythingElseTouched: boolean
): boolean {
  return (
    opening.displayName.trim() !== draft.displayName.trim() ||
    opening.entityId !== draft.entityId ||
    !isEqual(
      opening.config.groups.map(({ label, filters }) => ({ label, filters })),
      draft.config.groups.map(({ label, filters }) => ({ label, filters }))
    ) ||
    (everythingElseTouched &&
      opening.config.unmappedValue !== draft.config.unmappedValue)
  );
}
