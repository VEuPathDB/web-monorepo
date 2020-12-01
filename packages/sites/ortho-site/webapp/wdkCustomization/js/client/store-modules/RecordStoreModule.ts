import { Action, RecordActions } from 'wdk-client/Actions';
import * as RecordStoreModule from 'wdk-client/StoreModules/RecordStoreModule';
import {
  SEQUENCES_TABLE_NAME,
  PROTEIN_PFAMS_TABLE_NAME
} from 'ortho-client/records/utils';

export const key = 'record';

export const getAllFields = RecordStoreModule.getAllFields;

export function reduce(state = {} as RecordStoreModule.State, action: Action): RecordStoreModule.State {
  const nextState = RecordStoreModule.reduce(state, action);

  switch (action.type) {
    case RecordActions.RECORD_RECEIVED:
      const nextStateWithCollapsedSections = action.payload.recordClass.urlSegment === 'group'
        ? {
            ...nextState,
            collapsedSections: RecordStoreModule.getAllFields(nextState).filter(
              name => (
                name === SEQUENCES_TABLE_NAME ||
                name === PROTEIN_PFAMS_TABLE_NAME
              )
            )
          }
        : nextState;

      return {
        ...nextStateWithCollapsedSections,
        navigationVisible: true
      };

    default:
      return nextState;
  }
}

export const observe = RecordStoreModule.observe;
