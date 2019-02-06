import { makeActionCreator, InferAction } from "wdk-client/Utils/ActionCreatorUtils";

export const notifyUnhandledError = makeActionCreator(
  'unhandled-error/notify',
  /** Since anything can be thrown, we have to expect anything. */
  (error: any) => ({ error })
);

export type Action = InferAction<typeof notifyUnhandledError>;
