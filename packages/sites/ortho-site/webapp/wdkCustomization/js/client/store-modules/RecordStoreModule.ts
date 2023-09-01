import { combineEpics } from 'redux-observable';

import { Action, RecordActions } from '@veupathdb/wdk-client/lib/Actions';
import * as RecordStoreModule from '@veupathdb/wdk-client/lib/StoreModules/RecordStoreModule';
import {
  SEQUENCES_TABLE_NAME,
  PROTEIN_PFAMS_TABLE_NAME,
} from 'ortho-client/records/utils';

export const getAllFields = RecordStoreModule.getAllFields;

export function reduce(
  state = {} as RecordStoreModule.State,
  action: Action
): RecordStoreModule.State {
  const nextState = RecordStoreModule.reduce(state, action);

  switch (action.type) {
    case RecordActions.RECORD_RECEIVED:
      return action.payload.recordClass.urlSegment === 'group'
        ? {
            ...nextState,
            collapsedSections: RecordStoreModule.getAllFields(nextState).filter(
              (name) =>
                name === SEQUENCES_TABLE_NAME ||
                name === PROTEIN_PFAMS_TABLE_NAME
            ),
          }
        : nextState;

    default:
      return nextState;
  }
}

const {
  observeNavigationVisibilityPreference,
  observeNavigationVisibilityState,
} = RecordStoreModule.makeNavigationVisibilityPreferenceEpics((_) => true);

export const observe = combineEpics(
  RecordStoreModule.observe,
  observeNavigationVisibilityPreference,
  observeNavigationVisibilityState
);
