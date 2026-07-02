// Wizard state utility functions

import { every } from 'lodash';

import {
  QuestionWithParameters,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { ParameterGroupUI, WizardState } from './WizardTypes';

import { GroupState } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';


export function constructParameterGroupUIs(
  question: QuestionWithParameters,
  paramValues: ParameterValues,
  defaultParamValues: ParameterValues,
  groupUIState: Record<string, GroupState>,
  activeGroupIx: number
): ParameterGroupUI[] {
  return question.groups.map((group, ix) =>
    Object.assign(
      {},
      group,
      {
        selectedInPanel: ix === activeGroupIx,
        precedingTheGroupThatIsSelectedInPanel:
          activeGroupIx > -1 && ix + 1 === activeGroupIx,
      },
      {
        filteredCountState: groupUIState[group.name]!.filteredCountState,
      },
      {
        allValuesDefault: every(
          group.parameters.map(
            (paramName) =>
              paramValues[paramName] == defaultParamValues[paramName]
          )
        ),
      }
    )
  );
}

// Immutable state modifiers
// -------------------------

/**
 * Show or hide popup with filter summary.
 * @param {WizardState} wizardState
 * @param {boolean} visiblity
 * @return {WizardState}
 */
export function setFilterPopupVisiblity(
  wizardState: WizardState,
  visible: boolean
): WizardState {
  return Object.assign({}, wizardState, {
    filterPopupState: Object.assign({}, wizardState.filterPopupState, {
      visible,
    }),
  });
}

/**
 * Set if filter popup should hide when navigation elements are clicked
 * @param {WizardState} wizardState
 * @param {boolean} pinned
 * @return {WizardState}
 */
export function setFilterPopupPinned(
  wizardState: WizardState,
  pinned: boolean
): WizardState {
  return Object.assign({}, wizardState, {
    filterPopupState: Object.assign({}, wizardState.filterPopupState, {
      pinned,
    }),
  });
}
