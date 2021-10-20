import { get, isPlainObject } from 'lodash';
import React from 'react';
import { BasketActions, ResultPanelActions, ResultTableSummaryViewActions } from '@veupathdb/wdk-client/lib/Actions';
import { attemptAction } from './DataRestrictionActionCreators';
import {getResultTypeDetails} from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import { isUserApprovedForStudy } from '../study-access/permission';
import { getStudyAccess, getStudyId, getStudyPolicyUrl, getStudyRequestNeedsApproval } from '../shared/studies';

// Data stuff =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// per https://docs.google.com/presentation/d/1Cmf2GcmGuKbSTcH4wdeTEvRHTi9DDoh5-MnPm1MkcEA/edit?pli=1#slide=id.g3d955ef9d5_3_2

// Actions
// -------
export const Action = {
  // Access Search page
  search: 'search',
  // Use a step or column analysis tool
  analysis: 'analysis',
  // Run a strategy
  results: 'results',
  // View beyond first 20 records
  paginate: 'paginate',
  // Click record page link in results page
  record: 'record',
  // Access a record page
  recordPage: 'recordPage',
  // Access download page
  downloadPage: 'downloadPage',
  // Click download link in results page or homepage
  download: 'download',
  // Use the basket
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
  // not ready for release, only study page
  notready: 'notready',
}

// 

// strictActions will popup: "go home" (this is a forbidden page) 
// non strict actions (clicked on link to do something) will popup: "dismiss" (you may stay in this page)
export const strictActions = [ Action.search, Action.analysis, Action.results, Action.recordPage, Action.downloadPage ];

// the value  'login' or 'approval' will affect the message to the user: what is required. 
// https://docs.google.com/presentation/d/1Cmf2GcmGuKbSTcH4wdeTEvRHTi9DDoh5-MnPm1MkcEA/edit?pli=1#slide=id.g3d955ef9d5_3_2
export const accessLevels = {
  "public": {
    [Action.search]: Require.allow,
    [Action.analysis]: Require.allow,
    [Action.results]: Require.allow,
    [Action.paginate]: Require.allow,
    [Action.record]: Require.allow,
    [Action.recordPage]: Require.allow,
    [Action.download]: Require.allow,
    [Action.basket]: Require.allow
  },
  "controlled": {
    [Action.search]: Require.allow,
    [Action.analysis]: Require.allow,
    [Action.results]: Require.allow,
    [Action.paginate]: Require.approval,
    [Action.record]: Require.approval,
    [Action.recordPage]: Require.approval,
    [Action.download]: Require.approval,
    [Action.downloadPage]: Require.approval,
    [Action.basket]: Require.approval
  },
  /* not in use build 49
  "limited": {
    [Action.search]: Require.allow,
    [Action.analysis]: Require.allow,
    [Action.results]: Require.allow,
    [Action.paginate]: Require.login,
    [Action.record]: Require.login,
    [Action.recordPage]: Require.login,
    [Action.download]: Require.approval,
    [Action.basket]: Require.approval
  },*/
  "protected": {
    [Action.search]: Require.allow,
    [Action.analysis]: Require.allow,
    [Action.results]: Require.allow,
    [Action.paginate]: Require.approval,
    [Action.record]: Require.approval,
    [Action.recordPage]: Require.approval,
    [Action.download]: Require.approval,
    [Action.downloadPage]: Require.approval,
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
    [Action.downloadPage]: Require.approval,
    [Action.basket]: Require.approval
  },
  "prerelease": {
    [Action.search]: Require.notready,
    [Action.analysis]: Require.notready,
    [Action.results]: Require.notready,
    [Action.paginate]: Require.notready,
    [Action.record]: Require.notready,
    [Action.recordPage]: Require.notready,
    [Action.download]: Require.notready,
    [Action.downloadPage]: Require.notready,
    [Action.basket]: Require.notready
  }

};



// Getters!   =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

export function getPolicyUrl (study = {}, webAppUrl = '') {
  return !study
    ? null
    : getStudyPolicyUrl(study)
      ? webAppUrl + '/' + getStudyPolicyUrl(study)
      : null;
}

export function getRequestNeedsApproval (study = {}) {
  return getStudyRequestNeedsApproval(study);
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
      return 'see additional results';
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
  //if (actionRequiresLogin({ action, study })) return 'login or create an account';
  if ( getRequestNeedsApproval(study)=="0" ) return 'submit an access request';
  if (actionRequiresApproval({ action, study })) return 'acquire research approval';
  return 'contact us';
}

export function getRestrictionMessage ({ action, study }) {
  const intention = getActionVerb(action);
  const requirement = getRequirement({ action, study });
  return <span>Please <b>{requirement}</b> in order to {intention}.</span>;
}

// CHECKERS! =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

export function isAllowedAccess ({ permissions, approvedStudies, action, study }) {
  const access = getStudyAccess(study);
  const id = getStudyId(study);
  if (sessionStorage.getItem('restriction_override') === 'true') return true;
  if (!(access in accessLevels)) throw new Error(`Unknown access level "${access}".`);
  if (isUserApprovedForStudy(permissions, approvedStudies, id)) return true;
  if (accessLevels[access][action] === Require.allow) return true;
  //if (accessLevels[study.access][action] === Require.login) if (!user.isGuest) return true;
  // access not allowed, we need to build the modal popup
  return false;
}

// this function should be called isPrereleaseStudy (it is user independent)
// and the function below should be called canAccessPrereleaseStudy (result is user dependent)
// (changing the function name below involves updates in several files.)
export function isPrereleaseStudyTemp (access) {
  return ( access === 'prerelease' );
}

// the UI in (1) home page study card, (2) study menu, (3) study record page is different when
// - the study.access is prerelease
// - the user doesnt have access
export function isPrereleaseStudy (access, studyId, user, permissions) {
  if (typeof(user) != "undefined") {
    if (permissions != null) {
      if (
        access === 'prerelease' &&
        !isUserApprovedForStudy(permissions, user.properties.approvedStudies, studyId)
      ) {
        return true;
      } else {
        return false;
      }
    }

    if ( (access === 'prerelease') && (!user.properties.approvedStudies.includes(studyId))  ) 
      return true;
    else return false;
  }
  else {
    console.log("ATTENTION: user undefined in isPrerelease(),  study ID: " + studyId + " -- access: " + access + " --  showing searches");
    return false;
  }
}

// we will request the user to login if (1) guest and (2) explicit approval not needed
/* 
export function actionRequiresLogin ({ study, action }) {
  if (accessLevels[study.access][action] === Require.login) return true;
  else return false;
}
*/

// we will request the user to request approval if explicit approval needed (guest or not)
export function actionRequiresApproval ({ study, action }) {
  if (accessLevels[getStudyAccess(study)][action] === Require.approval) return true;
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
  return recordClass == null || recordClass.fullName.startsWith('DS_');
}


// Redux Middleware
// ----------------

/**
 * Redux middleware for applying restrictions to specific redux actions.
 */
export const reduxMiddleware = store => next => action => {
  if (!isPlainObject(action) || action.type == null) return next(action);
  const restrictedAction = getDataRestrictionActionAndRecordClass(
    store.getState(),
    action,
    (dataRestrictionAction, recordClassName) =>
      attemptAction(dataRestrictionAction,{
        studyId: getIdFromRecordClassName(recordClassName),
        onAllow: () => next(action)
      })
  );
  return restrictedAction == null ? next(action) : store.dispatch(restrictedAction);
}

/**
 * Checks if a redux action should be restricted, and if so, calls `callback`
 * with the restriction Action, and the record class name associated with the
 * action.
 * 
 * Return null to indicate that the redux action does not need to be
 * restricted.
 */
function getDataRestrictionActionAndRecordClass(state, action, callback) {
  if (!isPlainObject(action)) return null;
  
  switch(action.type || '') {
    case ResultPanelActions.openTabListing.type:
      return getRecordClassNameByResultType(action.payload.resultType, recordClassName =>
        callback(Action.results, recordClassName));

    case 'step-analysis/select-tab':
    case 'step-analysis/create-new-tab': {
      return  getRecordClassNameByStepId(state.stepAnalysis.stepId, recordClassName =>
        callback(Action.analysis, recordClassName));
    }

    case BasketActions.requestUpdateBasket.type:
      return callback(Action.basket, action.payload.recordClassName);

    case BasketActions.requestAddStepToBasket.type:
      return getRecordClassNameByStepId(action.payload.stepId, recordClassName =>
        callback(Action.basket, recordClassName));

    case ResultTableSummaryViewActions.requestPageSizeUpdate.type:
    case ResultTableSummaryViewActions.requestSortingUpdate.type:
      return getRecordClassNameByResultType(getResultTypeByViewId(action.payload.viewId, state), recordClassName =>
        callback(Action.paginate, recordClassName));

    case ResultTableSummaryViewActions.viewPageNumber.type:
      return action.payload.page === 1
        ? null
        : getRecordClassNameByResultType(getResultTypeByViewId(action.payload.viewId, state), recordClassName =>
            callback(Action.paginate, recordClassName));

    default:
        return null;
  }
}

function getResultTypeByViewId(viewId, state) {
  return get(state, ['resultTableSummaryView', viewId, 'resultType']);
}

function getRecordClassNameByStepId(stepId, callback) {
  return async function run({ wdkService }) {
    try {
      const step = await wdkService.findStep(stepId);
      return callback(step.recordClassName);
    }
    catch(error) {
      return callback(null);
    }
  };
}

function getRecordClassNameByResultType(resultType, callback) {
  return async function run({ wdkService }) {
    try {
      const { recordClassName } = await getResultTypeDetails(wdkService, resultType)
      return callback(recordClassName);
    }
    catch(error) {
      return callback(null);
    }
  };
}
