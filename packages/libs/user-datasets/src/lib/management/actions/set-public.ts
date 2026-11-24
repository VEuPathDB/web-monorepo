import { InferAction, makeActionCreator } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { identity } from 'lodash';

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
  readonly general: ReadonlyArray<string>;
  readonly byField: Record<string, ReadonlyArray<string>>;
};

export enum CommunityUpdateActionStateType {
  NotStarted,
  Pending,
  Success,
  Error,
}

export type CommunityUpdateActionState =
  | { readonly type: (
    | CommunityUpdateActionStateType.NotStarted
    | CommunityUpdateActionStateType.Pending
    | CommunityUpdateActionStateType.Success
  ) }
  | {
    readonly type: CommunityUpdateActionStateType.Error;
    readonly error: CommunityPromotionError;
  };

export const setCommunityUpdateState = makeActionCreator(
  "ud/mgmt/change-visibility/set-state",
  identity<CommunityUpdateActionState>,
);

export type SetCommunityStateAction = InferAction<typeof setCommunityUpdateState>;
