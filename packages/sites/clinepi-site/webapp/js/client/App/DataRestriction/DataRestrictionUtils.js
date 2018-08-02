// Data stuff =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// per https://docs.google.com/presentation/d/1Cmf2GcmGuKbSTcH4wdeTEvRHTi9DDoh5-MnPm1MkcEA/edit?pli=1#slide=id.g3d955ef9d5_3_2
export const accessLevels = {
  public: {},
  controlled: {
    approvalRequired: ['download', 'downloadPage', 'downloadFile']
  },
  limited: {
    loginRequired: ['paginate', 'record'],
    approvalRequired: ['download', 'downloadPage', 'downloadFile']
  },
  protected: {
    approvalRequired: ['paginate', 'record', 'download', 'downloadPage', 'downloadFile']
  },
  private: {
    approvalRequired: [ 'search', 'analysis', 'results', 'paginate', 'download', 'downloadPage', 'downloadFile']
  }
};

export const strictActions = [ 'search', 'analysis', 'results', 'paginate', 'record', 'download', 'downloadPage', 'downloadFile' ];

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
    case 'record':
      return 'access a record page';
    case 'downloadPage':
      return 'download a search result';
    case 'download':
      return 'download data';
    case 'downloadFile':
      return 'download files';
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
