// Wizard state utility functions

import { memoize, pick } from 'lodash';
import { getFilterFields } from '@veupathdb/wdk-client/lib/Views/Question/Params/FilterParamNew/FilterParamUtils';

/**
 * Create initial wizard state object
 */
export function createInitialState(question, recordClass, paramValues, defaultParamValues, customName) {

  const paramUIState = question.parameters.reduce(function(uiState, param) {
    return Object.assign(uiState, { [param.name]: createInitialParamState(param) });
  }, {});

  const groupUIState = question.groups.reduce(function(groupUIState, group) {
    return Object.assign(groupUIState, {
      [group.name]: {
        accumulatedTotal: undefined,
        valid: undefined,
        loading: false
      }
    });
  }, {});

  const filterPopupState = {
    visible: false,
    pinned: false
  }

  return {
    question,
    defaultParamValues,
    paramValues,
    paramUIState,
    groupUIState,
    filterPopupState,
    recordClass,
    activeGroup: undefined,
    updatingParamName: undefined,
    submitting: undefined,
    customName: customName || ''
  };
}

export function createInitialParamState(param) {
  switch(param.type) {
    case 'filter': {
      const filterFields = getFilterFields(param).toArray();
      const ontology = param.ontology;
      return {
        ontology: ontology,
        activeOntologyTerm: filterFields.length > 0 ? filterFields[0].term : null,
        hideFilterPanel: filterFields.length === 1,
        hideFieldPanel: filterFields.length === 1,
        fieldStates: {},
        defaultMemberFieldState: {
          sort: {
            columnKey: 'value',
            direction: 'asc',
            groupBySelected: false
          },
          searchTerm: ''
        },
        defaultRangeFieldState: {
        },
        defaultMultiFieldState: {
          // retain default ontology sort by default
          sort: undefined,
          searchTerm: ''
        }
      }
    }

    case 'single-pick-vocabulary':
      return {
        vocabulary: param.vocabulary
      };

    default:
      return {};
  }

}

/**
 * Get the default parameter values
 * @param {WizardState} wizardState
 * @return {Record<string, string>}
 */
export function getDefaultParamValues(wizardState) {
  return wizardState.defaultParamValues;
}

/**
 * Determine if the parameters of a given group have their default value.
 * @param {WizardState} wizardState
 * @param {Group} group
 * @return {boolean}
 */
export function groupParamsValuesAreDefault(wizardState, group) {
  const defaultValues = getDefaultParamValues(wizardState);
  return group.parameters.every(paramName =>
    wizardState.paramValues[paramName] === defaultValues[paramName]);
}

export function getGroup(wizardState, groupName) {
  return getGroupMap(wizardState.question).get(groupName);
}

export function getParameter(wizardState, paramName) {
  return getParamMap(wizardState.question).get(paramName);
}

/**
 * Get the set of parameters for a given group.
 */
export function getParameterValuesForGroup(wizardState, groupName) {
  const group = getGroup(wizardState, groupName);
  return pick(wizardState.paramValues, group.parameters);
}

const getGroupMap = memoize(question => new Map(question.groups.map(g => [g.name, g])));
const getParamMap = memoize(question => new Map(question.parameters.map(p => [p.name, p])));


// Immutable state modifiers
// -------------------------

/**
 * Show or hide popup with filter summary.
 * @param {WizardState} wizardState
 * @param {boolean} visiblity
 * @return {WizardState}
 */
export function setFilterPopupVisiblity(wizardState, visible) {
  return updateObjectImmutably(wizardState, ['filterPopupState', 'visible'], visible);
}

/**
 * Set if filter popup should hide when navigation elements are clicked
 * @param {WizardState} wizardState
 * @param {boolean} pinned
 * @return {WizardState}
 */
export function setFilterPopupPinned(wizardState, pinned) {
  return updateObjectImmutably(wizardState, ['filterPopupState', 'pinned'], pinned);
}

/**
 * Update paramValues with defaults.
 * @param {WizardState} wizardState
 * @return {WizardState}
 */
export function resetParamValues(wizardState) {
  return updateObjectImmutably(wizardState, ['paramValues'], getDefaultParamValues(wizardState));
}

/**
 * Creates a new object based on input object with an updated value
 * a the specified path.
 */
function updateObjectImmutably(object, [key, ...restPath], value) {
  const isObject = typeof object === 'object';
  if (!isObject || (isObject && !(key in object)))
    throw new Error("Invalid key path");

  return Object.assign({}, object, {
    [key]: restPath.length === 0 ? value
      : updateObjectImmutably(object[key], restPath, value)
  })
}
