import { createEvent } from 'wdk-client/Platform';

// Data stuff =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// per https://docs.google.com/presentation/d/1Cmf2GcmGuKbSTcH4wdeTEvRHTi9DDoh5-MnPm1MkcEA/edit?pli=1#slide=id.g3d955ef9d5_3_2

// strictActions will popup: "go home" (this is a forbidden page) 
// non strict actions (clicked on link to do something) will popup: "dismiss" (you may stay in this page)
export const strictActions = [ 'search', 'analysis', 'results', 'record', 'downloadPage' ];

// the value  'login' or 'approval' will affect the message to the user: what is required. 
// https://docs.google.com/presentation/d/1Cmf2GcmGuKbSTcH4wdeTEvRHTi9DDoh5-MnPm1MkcEA/edit?pli=1#slide=id.g3d955ef9d5_3_2
export const accessLevels = {
  "controlled": {"search": "allowed", "analysis": "allowed", "results": "allowed", "paginate": "allowed", "record": "allowed", "download": "approval"},
  "limited": {"search": "allowed", "analysis": "allowed", "results": "allowed", "paginate": "login", "record": "login", "download": "approval"},
  "protected": {"search": "allowed", "analysis": "allowed", "results": "allowed", "paginate": "approval", "record": "approval", "download": "approval"},
  "private": {"search": "approval", "analysis": "approval", "results": "approval", "paginate": "approval", "record": "approval", "download": "approval"}
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
  if (accessLevels[study.access][action] === "allowed") return true;
  if (accessLevels[study.access][action] === "login") if (!user.isGuest) return true;
  // access not allowed, we need to build the modal popup
  return false;
}

// we will request the user to login if (1) guest and (2) explicit approval not needed 
export function actionRequiresLogin ({ study, action }) {
  if (accessLevels[study.access][action] === "login") return true;
  else return false;
}

// we will request the user to request approval if explicit approval needed (guest or not)
export function actionRequiresApproval ({ study, action }) {
  if (accessLevels[study.access][action] === "approval") return true;
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

export function getIdFromRecordClassName (recordClass) {
  if (typeof recordClass !== 'string') return null;
  if (recordClass.length > 13) recordClass = recordClass.slice(0, 13);
  const result = recordClass.match(/^DS_[^_]+/g);
  return result === null
    ? null
    : result[0];
}

export function emitRestriction (action, details = {}) {
  const detail = Object.assign({}, details, { action });
  const event = createEvent('DataRestricted', { detail });
  document.dispatchEvent(event);
}
