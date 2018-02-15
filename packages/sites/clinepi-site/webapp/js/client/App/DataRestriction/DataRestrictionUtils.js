// Data stuff =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
export const accessLevels = {
  public: {},
  limited: {
    loginRequired: ['download', 'downloadPage']
  },
  protected: {
    loginRequired: ['paginate'],
    approvalRequired: ['download', 'downloadPage']
  },
  private: {
    approvalRequired: [ 'search', 'results', 'paginate', 'analysis', 'download', 'downloadPage']
  }
};

export const strictActions = [ 'search', 'results', 'downloadPage' ];

// Getters!   =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

export function getPolicyUrl (study = {}, webAppUrl = '') {
  return !study
    ? null
    : study.policyUrl
      ? study.policyUrl
      : study.policyAppUrl
        ? webAppUrl + study.policyAppUrl
        : null;
}

export function getActionVerb (action) {
  if (typeof action !== 'string') return null;
  switch (action) {
    case 'search':
      return 'search the data';
    case 'analysis':
      return 'create and view analyses';
    case 'results':
      return 'view search results';
    case 'paginate':
      return 'see more than 25 results';
    case 'downloadPage':
    case 'download':
      return 'download data';
    default:
      return action;
  }
};

export function getRequirement ({ action, study }) {
  if (actionRequiresLogin({ action, study })) return 'login or create an account';
  if (actionRequiresApproval({ action, study })) return 'acquire research approval';
  return 'contact us';
};

export function getStudyAccessLevel (study = {}) {
  const { id } = study;
  const hasValidAccessAttribute = Object.keys(accessLevels).includes(study.access);
  if (typeof id !== 'string')
    console.warn(`[getStudyAccessLevel] Invalid study id provided. Treating as 'public'. Received:`, { study });
  else if (!hasValidAccessAttribute)
    console.warn(`[getStudyAccessLevel] No or invalid [study.access] set in study @${id} (received "${study.access}"). Treating as 'public'.`);
  return hasValidAccessAttribute ? study.access : 'public';
};

export function getRestrictionMessage ({ action, study }) {
  const intention = getActionVerb(action);
  const requirement = getRequirement({ action, study });
  return <span>Please <b>{requirement}</b> in order to {intention}.</span>;
};

// CHECKERS! =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

export function actionRequiresLogin ({ study, action }) {
  const level = getStudyAccessLevel(study);
  if (!Object.keys(accessLevels).includes(level)) return;
  const { loginRequired } = accessLevels[level];
  return (Array.isArray(loginRequired) && loginRequired.includes(action));
}

export function actionRequiresApproval ({ study, action }) {
  const level = getStudyAccessLevel(study);
  if (!Object.keys(accessLevels).includes(level)) return;
  const { approvalRequired } = accessLevels[level];
  return (Array.isArray(approvalRequired) && approvalRequired.includes(action));
}

export function isAllowedAccess ({ user, action, study }) {
  if (sessionStorage.getItem('restriction_override') === 'true') return true;
  const loginRequired = actionRequiresLogin({ action, study });
  const isValidUser = typeof user === 'object' && ['isGuest', 'properties'].every(key => Object.keys(user).includes(key));
  if (loginRequired && (!isValidUser || user.isGuest)) return false;
  const approvalRequired = actionRequiresApproval({ action, study });
  const isApproved = isValidUser && !user.isGuest && user.properties.approvedStudies.includes(study.id);
  if (approvalRequired && !isApproved) return false;
  return true;
};



export function disableRestriction () {
  sessionStorage.setItem('restriction_override', true);
}
window._disableRestriction = disableRestriction;

export function enableRestriction () {
  sessionStorage.removeItem('restriction_override');
}
window._enableRestriction = enableRestriction;

export function isActionStrict (action) {
  return strictActions.includes(action);
}

export function getIdFromRecordClassName (recordClass) {
  if (typeof recordClass !== 'string') return null;
  if (recordClass.length > 13) recordClass = recordClass.slice(0, 13);
  const result = recordClass.match(/^DS_[^_]+/g);
  return result === null
    ? null
    : result[0];
};

export function emitRestriction (action, details = {}) {
  const detail = Object.assign({}, details, { action });
  const event = new CustomEvent('DataRestricted', { detail });
  document.dispatchEvent(event);
};
