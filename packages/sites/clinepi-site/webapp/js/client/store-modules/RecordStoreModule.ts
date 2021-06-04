import { combineEpics } from 'redux-observable';

import { Action, RecordActions } from '@veupathdb/wdk-client/lib/Actions';
import * as RecordStoreModule from '@veupathdb/wdk-client/lib/StoreModules/RecordStoreModule';
import { pruneDescendantNodes } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getRefName, getTargetType } from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export const key = 'record';

export function reduce(state: RecordStoreModule.State, action: Action) {
  const nextState = RecordStoreModule.reduce(state, action);

  // In dataset record pages, do not display the "References" table
  return action.type !== RecordActions.RECORD_RECEIVED || !isDatasetRecord(nextState.record)
    ? nextState
    : {
        ...nextState,
        categoryTree: pruneDescendantNodes(
          node => getTargetType(node) !== 'table' || getRefName(node) !== 'References',
          nextState.categoryTree
        )
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
