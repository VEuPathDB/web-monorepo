import {
  makeActionCreator,
  InferAction
} from 'wdk-client/Utils/ActionCreatorUtils';
import { PrimaryKey } from 'wdk-client/Utils/WdkModel';
import { BasketRecordOperation } from 'wdk-client/Service/Mixins/BasketsService';
export type BasketScope = 'global' | 'project';

// If `operation` is `removeAll`, `primaryKeys` is ignored
export const requestUpdateBasket = makeActionCreator(
  'requestUpdateBasket',
  (
    operation: BasketRecordOperation,
    recordClassName: string,
    primaryKeys: Array<PrimaryKey>
  ) => ({ operation: operation, recordClassName, primaryKeys })
);

export const requestUpdateBasketWithConfirmation = makeActionCreator(
  'requestUpdateBasketWithConfirmation',
  (
    operation: BasketRecordOperation,
    recordClassName: string,
    primaryKeys: PrimaryKey[]
  ) =>  ({ operation, recordClassName, primaryKeys })
);

export const cancelRequestUpdateBasket = makeActionCreator('cancelRequestUpdateBasket');

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

export const requestBasketCounts = makeActionCreator(
  'requestBasketCounts'
);

export const fulfillBasketCounts = makeActionCreator(
  'fulfillBasketCounts',
  (counts: Record<string, number>) => ({ counts })
);

export const requestBasketDetails = makeActionCreator(
  'resultTableSummaryView/requestBasketDetails',
  (basketName: string) => ({ basketName })
);

export const fulfillBasketDetails = makeActionCreator(
  'resultTableSummaryView/fulfillBasketDetails',
  (basketName: string, recordClassName: string, searchName: string) =>
    ({ basketName, recordClassName, searchName })
);

export const saveBasketToStrategy = makeActionCreator(
  'saveBasketToStrategy',
  (basketName: string) => ({ basketName })
);

export type Action = InferAction<
  | typeof requestUpdateBasket
  | typeof requestUpdateBasketWithConfirmation
  | typeof cancelRequestUpdateBasket
  | typeof fulfillUpdateBasket
  | typeof requestAddStepToBasket
  | typeof fulfillAddStepToBasket
  | typeof requestBasketCounts
  | typeof fulfillBasketCounts
  | typeof requestBasketDetails
  | typeof fulfillBasketDetails
  | typeof saveBasketToStrategy
  >
