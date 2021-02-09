import { fetchStudies } from 'ebrc-client/App/Studies/StudyActionCreators';
import { checkPermissions } from 'ebrc-client/StudyAccess/permission';

import { isAllowedAccess } from './DataRestrictionUtils';

export const RESTRICTED_ACTION = 'data-restriction/restricted';
export const UNRESTRICTED_ACTION = 'data-restriction/unrestricted';
export const RESTRICTION_CLEARED = 'data-restriction/cleared';

export function attemptAction(action, details = {}) {
  return function run({ wdkService }) {
    const user$ = wdkService.getCurrentUser();
    const studies$ = fetchStudies(wdkService);

    return Promise.all([ user$, studies$ ]).then(([ user, studies ]) => {
      return checkPermissions(user).then(permissions => {
        return handleAction(
          permissions,
          user,
          studies[0],
          action,
          details
        );
      });
    })
  }
}

export function restricted(study, action) {
  return {
    type: RESTRICTED_ACTION,
    payload: { study, action }
  }
}

export function unrestricted(study, action) {
  return {
    type: UNRESTRICTED_ACTION,
    payload: { study, action }
  }
}

export function clearRestrictions() {
  return { type: RESTRICTION_CLEARED }
}

// Create restriction action
function handleAction(permissions, user, studies, action, { studyId, onAllow, onDeny }) {
  console.info(label('Restriction Encountered:'), { action, studyId });
  const study = studies.find(study => studyId === study.id);

  if (study == null) {
    const error = new Error(label(`Invalid reference: couldn't find study with id "${studyId}"`));
    console.warn('Allowing action `%s` for unknown study `%s`.', action, study);
    console.error(error);
    if (typeof onAllow === 'function') onAllow();
    return clearRestrictions();
  }

  if (isAllowedAccess({ permissions, user, action, study })) {
    if (typeof onAllow === 'function') onAllow();
    return unrestricted(study, action);
  }

  if (typeof onDeny === 'function') onDeny();
  return restricted(study, action);
}

export function label(str) {
  return `[DataRestriction] ${str}`;
}
