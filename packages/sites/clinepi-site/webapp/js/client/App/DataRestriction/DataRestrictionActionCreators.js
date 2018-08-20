import { fetchStudies } from 'Client/App/Studies/StudyActionCreators';

import { isAllowedAccess } from './DataRestrictionUtils';

export const RESTRICTED_ACTION = 'data-restriction/restricted';
export const UNRESTRICTED_ACTION = 'data-restriction/unrestricted';
export const RESTRICTION_CLEARED = 'data-restriction/cleared';

export function attemptAction(action, details = {}) {
  return function run({ wdkService }) {
    const user$ = wdkService.getCurrentUser();
    const studies$ = fetchStudies(wdkService);

    return Promise.all([ user$, studies$ ]).then(
      ([ user, studies ]) => handleAction(user, studies[0], action, details)
    )
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
function handleAction(user, studies, action, { studyId, onSuccess }) {
  console.info(label('Restriction Encountered:'), { action, studyId });
  const study = studies.find(study => studyId === study.id);

  if (study == null) {
    throw new Error(label(`Invalid reference: couldn't find study with id "${studyId}"`));
  }

  if (isAllowedAccess({ user, action, study })) {
    if (typeof onSuccess === 'function') onSuccess();
    return unrestricted(study, action);
  }

  return restricted(study, action);
}

function label(str) {
  return `[DataRestriction] ${str}`;
}
