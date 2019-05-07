import {
  makeActionCreator,
  InferAction
} from 'wdk-client/Utils/ActionCreatorUtils';
import { PrimaryKey } from 'wdk-client/Utils/WdkModel';
import { BasketRecordOperation } from 'wdk-client/Service/Mixins/BasketsService';
export type BasketScope = 'global' | 'project';

export const requestUpdateBasket = makeActionCreator(
  'requestUpdateBasket',
  (
    operation: BasketRecordOperation,
    recordClassName: string,
    primaryKeys: Array<PrimaryKey>
  ) => ({ operation: operation, recordClassName, primaryKeys })
);

export const fulfillUpdateBasket = makeActionCreator(
  'fulfillUpdateBasket',
  (
    operation: BasketRecordOperation,
    recordClassName: string,
    primaryKeys: Array<PrimaryKey>
  ) => ({ operation, recordClassName, primaryKeys })
);

export const requestAddStepToBasket = makeActionCreator(
  'requestAddStepToBasket',
  (stepId: number) => ({ stepId })
);

export const fulfillAddStepToBasket = makeActionCreator(
  'fulfillAddStepToBasket',
  (stepId: number) => ({ stepId })
)

export type Action =
  | InferAction<typeof requestUpdateBasket>
  | InferAction<typeof fulfillUpdateBasket>
  | InferAction<typeof requestAddStepToBasket>
  | InferAction<typeof fulfillAddStepToBasket>