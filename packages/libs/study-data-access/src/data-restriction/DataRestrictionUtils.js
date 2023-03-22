import { get, isPlainObject } from 'lodash';
import React from 'react';
import { BasketActions, ResultPanelActions, ResultTableSummaryViewActions } from '@veupathdb/wdk-client/lib/Actions';
import {getResultTypeDetails} from '@veupathdb/wdk-client/lib/Utils/WdkResult';

import { getStudyId, getStudyPolicyUrl, getStudyRequestNeedsApproval } from '../shared/studies';
import { isUserApprovedForAction, isUserFullyApprovedForStudy } from '../study-access/permission';

import { attemptAction } from './DataRestrictionActionCreators';
import {
  Action,
  strictActions,
} from './DataRestrictionUiActions';

// Getters!   =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

export function getPolicyUrl (study = {}) {
  return !study
    ? null
    : getStudyPolicyUrl(study);
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

export function getRequirement ({ action, permissions, study, user }) {
  //if (actionRequiresLogin({ action, study })) return 'login or create an account';
  if ( getRequestNeedsApproval(study)=="0" ) return 'submit an access request';
  if (actionRequiresApproval({ action, permissions, study, user })) return 'acquire research approval';
  return 'contact us';
}

export function getRestrictionMessage ({ action, permissions, study, user }) {
  const intention = getActionVerb(action);
  const requirement = getRequirement({ action, permissions, study, user });
  return <span>Please <b>{requirement}</b> in order to {intention}.</span>;
}

// CHECKERS! =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

export function isAllowedAccess ({ permissions, action, study }) {
  const id = getStudyId(study);
  if (sessionStorage.getItem('restriction_override') === 'true') return true;
  if (isUserApprovedForAction(permissions, id, action)) return true;
  // access not allowed, we need to build the modal popup
  return false;
}

// the UI in (1) home page study card, (2) study menu, (3) study record page is different when
// - the study.access is prerelease
// - the user doesnt have access
export function isPrereleaseStudy (access, studyId, permissions) {
  return (
    access === 'prerelease' &&
    !isUserFullyApprovedForStudy(permissions, studyId)
  );
}

// we will request the user to request approval if explicit approval needed (guest or not)
export function actionRequiresApproval ({ action, permissions, study, user }) {
  const datasetId = getStudyId(study);

  return isUserApprovedForAction(
    permissions,
    datasetId,
    action
  ) === false;
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
  return strictActions.has(action);
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
