import { makeActionCreator, InferAction } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { fetchStudies, getStudyId, Study } from '../shared/studies';
import { WdkDependenciesWithStudyAccessApi } from '../shared/wrapWdkDependencies';

import { checkPermissions, UserPermissions } from '../study-access/permission';

import { isAllowedAccess } from './DataRestrictionUtils';

export type Action =
  | InferAction<typeof restricted>
  | InferAction<typeof unrestricted>
  | InferAction<typeof clearRestrictions>;

// FIXME: Retire this type once DataRestrictionUtils has been properly typed
export type DataRestrictionActionType = string;

export interface ActionAttemptDetails {
  studyId: string;
  onAllow?: () => void;
  onDeny?: () => void;
}

export function attemptAction(action: DataRestrictionActionType, details: ActionAttemptDetails) {
  return function run({ wdkService, studyAccessApi }: WdkDependenciesWithStudyAccessApi) {
    const user$ = wdkService.getCurrentUser();
    const studies$ = fetchStudies(wdkService);

    return Promise.all([ user$, studies$ ]).then(([ user, studies ]) => {
      return checkPermissions(user, studyAccessApi).then(permissions => {
        return handleAction(
          permissions,
          studies.records,
          action,
          details
        );
      });
    })
  }
}

export const restricted = makeActionCreator(
  'data-restriction/restricted',
  (study: Study, action: DataRestrictionActionType) => ({
    study,
    action
  })
);

export const unrestricted = makeActionCreator(
  'data-restriction/unrestricted',
  (study: Study, action: DataRestrictionActionType) => ({
    study,
    action
  })
);

export const clearRestrictions = makeActionCreator('data-restriction/cleared');

// Create restriction action
function handleAction(
  permissions: UserPermissions,
  studies: Study[],
  action: DataRestrictionActionType,
  { studyId, onAllow, onDeny }: Partial<ActionAttemptDetails> = {}
): Action {
  console.info(label('Restriction Encountered:'), { action, studyId });
  const study = studies.find(study => studyId === getStudyId(study));

  if (study == null) {
    const error = new Error(label(`Invalid reference: couldn't find study with id "${studyId}"`));
    console.warn('Allowing action `%s` for unknown study `%s`.', action, study);
    console.error(error);
    if (typeof onAllow === 'function') onAllow();
    return clearRestrictions();
  }

  if (isAllowedAccess({ permissions, action, study })) {
    if (typeof onAllow === 'function') onAllow();
    return unrestricted(study, action);
  }

  if (typeof onDeny === 'function') onDeny();
  return restricted(study, action);
}

export function label(str: string) {
  return `[DataRestriction] ${str}`;
}
