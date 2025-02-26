import { combineEpics } from 'redux-observable';

import { Action, RecordActions } from '@veupathdb/wdk-client/lib/Actions';
import * as RecordStoreModule from '@veupathdb/wdk-client/lib/StoreModules/RecordStoreModule';
import {
  SEQUENCES_TABLE_NAME,
  PROTEIN_PFAMS_TABLE_NAME,
} from 'ortho-client/records/utils';

export const getAllFields = RecordStoreModule.getAllFields;

const {
  observeNavigationVisibilityPreference,
  observeNavigationVisibilityState,
} = RecordStoreModule.makeNavigationVisibilityPreferenceEpics((_) => true);

export const observe = combineEpics(
  RecordStoreModule.observe,
  observeNavigationVisibilityPreference,
  observeNavigationVisibilityState
);
