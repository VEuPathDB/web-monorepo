import {makeActionCreator, InferAction} from 'wdk-client/Utils/ActionCreatorUtils';

export const requestImportStrategy = makeActionCreator(
  'requestImportStrategy',
  (strategySignature: string, selectedTab?: string) => ({ strategySignature, selectedTab })
)

export type Action = InferAction<
  | typeof requestImportStrategy
  >
