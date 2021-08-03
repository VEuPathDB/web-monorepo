import { combineEpics } from 'redux-observable';

import { Action, RecordActions } from '@veupathdb/wdk-client/lib/Actions';
import * as RecordStoreModule from '@veupathdb/wdk-client/lib/StoreModules/RecordStoreModule';
import { filterNodes, isBranch, pruneDescendantNodes, preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getRefName, getTargetType, getId, isIndividual } from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { getNodeChildren } from '@veupathdb/wdk-client/lib/Utils/OntologyUtils';

export const key = 'record';

export function reduce(state: RecordStoreModule.State, action: Action): RecordStoreModule.State {
  const nextState = RecordStoreModule.reduce(state, action);

  if (
    action.type !== RecordActions.RECORD_RECEIVED ||
    !isDatasetRecord(nextState.record)
  ) {
    return nextState;
  }

  // In dataset record pages...
  // (1) do not display the "References" table
  // (2) have all navigation sections expanded by default
  const categoryTree = pruneDescendantNodes(
    node => getTargetType(node) !== 'table' || getRefName(node) !== 'References',
    nextState.categoryTree
  );

  const navigationCategoriesExpanded = filterNodes(
    node => !isIndividual(node),
    categoryTree
  ).map(getId);

  return {
    ...nextState,
    categoryTree,
    navigationCategoriesExpanded,
  };
}

const {
  observeNavigationVisibilityPreference,
  observeNavigationVisibilityState
} = RecordStoreModule.makeNavigationVisibilityPreferenceEpics(_ => true);

export const observe = combineEpics(
  RecordStoreModule.observe,
  observeNavigationVisibilityPreference,
  observeNavigationVisibilityState
);

function isDatasetRecord(record: RecordInstance | undefined) {
  return record?.recordClassName === 'DatasetRecordClasses.DatasetRecordClass';
}
