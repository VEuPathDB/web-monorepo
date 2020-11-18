import { Action, RecordActions } from 'wdk-client/Actions';
import * as RecordStoreModule from 'wdk-client/StoreModules/RecordStoreModule';
import {
  GROUP_STATISTICS_TABLE_NAME,
  TAXON_COUNTS_TABLE_NAME
} from 'ortho-client/records/utils';

export const key = 'record';

export const getAllFields = RecordStoreModule.getAllFields;

export function reduce(state = {} as RecordStoreModule.State, action: Action): RecordStoreModule.State {
  const nextState = RecordStoreModule.reduce(state, action);

  switch (action.type) {
    case RecordActions.RECORD_RECEIVED:
      return action.payload.recordClass.urlSegment === 'group'
        ? {
            ...nextState,
            collapsedSections: RecordStoreModule.getAllFields(nextState).filter(
              name => (
                name !== TAXON_COUNTS_TABLE_NAME &&
                name !== GROUP_STATISTICS_TABLE_NAME
              )
            )
          }
        : nextState

    default:
      return nextState;
  }
}

export const observe = RecordStoreModule.observe;
