import { Action, RecordActions } from 'wdk-client/Actions';
import * as RecordStoreModule from 'wdk-client/StoreModules/RecordStoreModule';
import { pruneDescendantNodes } from 'wdk-client/Utils/TreeUtils';
import { getRefName, getTargetType } from 'wdk-client/Utils/CategoryUtils';
import { RecordInstance } from 'wdk-client/Utils/WdkModel';

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

export const observe = RecordStoreModule.observe;

function isDatasetRecord(record: RecordInstance | undefined) {
  return record?.recordClassName === 'DatasetRecordClasses.DatasetRecordClass';
}
