// Data stuff =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// per https://docs.google.com/presentation/d/1Cmf2GcmGuKbSTcH4wdeTEvRHTi9DDoh5-MnPm1MkcEA/edit?pli=1#slide=id.g3d955ef9d5_3_2

// Actions
// -------
export const Action = {
  search: 'search',
  analysis: 'analysis',
  results: 'results',
  paginate: 'paginate',
  record: 'record',
  recordPage: 'recordPage',
  downloadPage: 'downloadPage',
  download: 'download',
  basket: 'basket',
};


// Restriction levels
// ------------------
export const Require = {
  // nothing required
  allow: 'allowed',
  // login required
  login: 'login',
  // approval required
  approval: 'approval',
}

// 

// strictActions will popup: "go home" (this is a forbidden page) 
// non strict actions (clicked on link to do something) will popup: "dismiss" (you may stay in this page)
export const strictActions = [ Action.search, Action.analysis, Action.results, Action.recordPage, Action.downloadPage ];

// the value  'login' or 'approval' will affect the message to the user: what is required. 
// https://docs.google.com/presentation/d/1Cmf2GcmGuKbSTcH4wdeTEvRHTi9DDoh5-MnPm1MkcEA/edit?pli=1#slide=id.g3d955ef9d5_3_2
export const accessLevels = {
  "controlled": {
    [Action.search]: Require.allow,
    [Action.analysis]: Require.allow,
    [Action.results]: Require.allow,
    [Action.paginate]: Require.allow,
    [Action.record]: Require.allow,
    [Action.recordPage]: Require.allow,
    [Action.download]: Require.approval,
    [Action.basket]: Require.approval
  },
  "limited": {
    [Action.search]: Require.allow,
    [Action.analysis]: Require.allow,
    [Action.results]: Require.allow,
    [Action.paginate]: Require.login,
    [Action.record]: Require.login,
    [Action.recordPage]: Require.login,
    [Action.download]: Require.approval,
    [Action.basket]: Require.approval
  },
  "protected": {
    [Action.search]: Require.allow,
    [Action.analysis]: Require.allow,
    [Action.results]: Require.allow,
    [Action.paginate]: Require.approval,
    [Action.record]: Require.approval,
    [Action.recordPage]: Require.approval,
    [Action.download]: Require.approval,
    [Action.basket]: Require.approval
  },
  "private": {
    [Action.search]: Require.approval,
    [Action.analysis]: Require.approval,
    [Action.results]: Require.approval,
    [Action.paginate]: Require.approval,
    [Action.record]: Require.approval,
    [Action.recordPage]: Require.approval,
    [Action.download]: Require.approval,
    [Action.basket]: Require.approval
  }
};



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
    case Action.search:
      return 'search the data';
    case Action.analysis:
      return 'create and view analyses';
    case Action.results:
      return 'view search results';
    case Action.paginate:
      return 'see more than 25 results';
    case Action.record:
    case Action.recordPage:
      return 'access a record page';
    case Action.downloadPage:
      return 'download a search result';
    case Action.download:
      return 'download data';
    case Action.basket:
      return 'add to your basket'
    default: 
      return action;
  }
}

export function getRequirement ({ action, study }) {
  if (actionRequiresLogin({ action, study })) return 'login or create an account';
  if (actionRequiresApproval({ action, study })) return 'acquire research approval';
  return 'contact us';
}

export function getRestrictionMessage ({ action, study }) {
  const intention = getActionVerb(action);
  const requirement = getRequirement({ action, study });
  return <span>Please <b>{requirement}</b> in order to {intention}.</span>;
}

// CHECKERS! =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

export function isAllowedAccess ({ user, action, study }) {
  if (sessionStorage.getItem('restriction_override') === 'true') return true;
  // assuming approvedStudies only contain public studies for this user (in CineEpiWebsite CustomProfileService.java)
  if (user.properties.approvedStudies.includes(study.id)) return true;
  if (accessLevels[study.access][action] === Require.allow) return true;
  if (accessLevels[study.access][action] === Require.login) if (!user.isGuest) return true;
  // access not allowed, we need to build the modal popup
  return false;
}

// we will request the user to login if (1) guest and (2) explicit approval not needed 
export function actionRequiresLogin ({ study, action }) {
  if (accessLevels[study.access][action] === Require.login) return true;
  else return false;
}

// we will request the user to request approval if explicit approval needed (guest or not)
export function actionRequiresApproval ({ study, action }) {
  if (accessLevels[study.access][action] === Require.approval) return true;
  else return false;
}

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

export function getIdFromRecordClassName (recordClassName) {
  if (typeof recordClassName !== 'string') return null;
  if (recordClassName.length > 13) recordClassName = recordClassName.slice(0, 13);
  const result = recordClassName.match(/^DS_[^_]+/g);
  return result === null
    ? null
    : result[0];
}

export function isStudyRecordClass(recordClass) {
  return recordClass == null || recordClass.name.startsWith('DS_');
}
