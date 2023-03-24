import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';

export const requestImportStrategy = makeActionCreator(
  'requestImportStrategy',
  (strategySignature: string, selectedTab?: string) => ({
    strategySignature,
    selectedTab,
  })
);

export const fulfillImportStrategy = makeActionCreator(
  'fulfillImportStrategy',
  (strategyId: number, selectedTab?: string) => ({ strategyId, selectedTab })
);

export type Action = InferAction<
  typeof requestImportStrategy | typeof fulfillImportStrategy
>;
