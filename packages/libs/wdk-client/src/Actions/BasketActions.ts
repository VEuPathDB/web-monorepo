import {
  makeActionCreator,
  InferAction
} from 'wdk-client/Utils/ActionCreatorUtils';
import { PrimaryKey } from 'wdk-client/Utils/WdkModel';
import { BasketOperation } from 'wdk-client/Utils/WdkService';
export type BasketScope = 'global' | 'project';

export const requestUpdateBasket = makeActionCreator(
  'requestUpdateBasket',
  (
    operation: BasketOperation,
    recordClassName: string,
    primaryKeys: Set<PrimaryKey>
  ) => ({ operation: operation, recordClassName, primaryKeys })
);

export const fulfillUpdateBasket = makeActionCreator(
  'fulfillUpdateBasket',
  (
    operation: BasketOperation,
    recordClassName: string,
    primaryKeys: Set<PrimaryKey>
  ) => ({ operation, recordClassName, primaryKeys })
);

export type Action =
  | InferAction<typeof requestUpdateBasket>
  | InferAction<typeof fulfillUpdateBasket>;
