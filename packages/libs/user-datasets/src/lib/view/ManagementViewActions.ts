import lodash from 'lodash';
import * as util from '../Utils';
import * as VDI from '../Service/Model'

import { InferAction, makeActionCreator } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';

// region Dataset Visibility

/**
 * Represents one or more errors that were encountered while attempting to
 * promote one or more datasets to community datasets.
 */
export type CommunityPromotionError = {
  /**
   * Client-side exception message.
   */
  readonly clientError?: string;

  /**
   * Misc service errors that are unrelated to dataset state validation.
   */
  readonly serviceErrors?: readonly string[];

  /**
   * Validation error messages.
   */
  readonly validationErrors?: readonly CommunityPromotionValidationError[];
};

export type CommunityPromotionValidationError = {
  readonly datasetId: string;
  readonly general: readonly string[];
  readonly byField: Record<string, readonly string[]>;
};

export enum CommunityUpdateActionStateType {
  Pending,
  Success,
  Error,
}

export type CommunityUpdateActionState =
  | { readonly type: CommunityUpdateActionStateType.Pending }
  | { readonly type: CommunityUpdateActionStateType.Success }
  | {
  readonly type: CommunityUpdateActionStateType.Error;
  readonly error: CommunityPromotionError;
};

export const setCommunityUpdateState = makeActionCreator(
  "ud/mgmt/change-visibility/set-state",
  lodash.identity<util.Possible<CommunityUpdateActionState>>,
);

// endregion Dataset Visibility

// region Fetch Dataset

export enum DatasetFetchState {
  Pending,
  Success,
  NotFound,
  Error,
}

export const setDatasetFetchState = makeActionCreator(
  "ud/mgmt/fetch-dataset/set-state",
  (type: DatasetFetchState, dataset?: VDI.DatasetGetResponseBody) =>
    ({ type, dataset })
);
export const setDatasetFetchPending = () =>
  setDatasetFetchState(DatasetFetchState.Pending);
export const setDatasetFetchNotFound = () =>
  setDatasetFetchState(DatasetFetchState.NotFound);
export const setDatasetFetchSuccess = (dataset: VDI.DatasetGetResponseBody) =>
  setDatasetFetchState(DatasetFetchState.Success, dataset);
export const setDatasetFetchError = () =>
  setDatasetFetchState(DatasetFetchState.Error);

// endregion Fetch Dataset

export type Action =
  | InferAction<typeof setCommunityUpdateState>
  | InferAction<typeof setDatasetFetchState>
  ;