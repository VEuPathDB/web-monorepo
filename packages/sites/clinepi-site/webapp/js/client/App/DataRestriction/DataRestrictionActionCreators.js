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

export function restricted(studyId, action) {
  return {
    type: RESTRICTED_ACTION,
    payload: { studyId, action }
  }
}

export function unrestricted(studyId, action) {
  return {
    type: UNRESTRICTED_ACTION,
    payload: { studyId, action }
  }
}

export function clearRestrictions() {
  return { type: RESTRICTION_CLEARED }
}

// Create restriction action
function handleAction(user, studies, action, { studyId, onSuccess }) {
  console.info('DRD: Restriction Encountered:', { action, studyId });
  const study = getStudyById(studyId, studies);

  if (isAllowedAccess({ user, action, study })) {
    onSuccess();
    return unrestricted(studyId, action);
  }

  return restricted(studyId, action);
}

function getStudyById(studyId, studies) {
  if (typeof studyId !== 'string') return;
  const study = studies.find(({ id }) => studyId === id)
  return study
    ? study
    : console.error(`[getStudyById] Invalid reference: couldn't find study with id "${studyId}"`);
}
