import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';
import { PrimaryKey } from '../Utils/WdkModel';
import { Step } from '../Utils/WdkUser';
import { BasketPatchIdsOperation } from '../Service/Mixins/BasketsService';

export type BasketScope = 'global' | 'project';

export const requestUpdateBasket = makeActionCreator(
  'requestUpdateBasket',
  (
    operation: BasketPatchIdsOperation,
    recordClassName: string,
    primaryKeys: Array<PrimaryKey>
  ) => ({ operation: operation, recordClassName, primaryKeys })
);

export const requestClearBasket = makeActionCreator(
  'requestClearBasket',
  (recordClassName: string) => ({ recordClassName })
);

export const cancelRequestUpdateBasket = makeActionCreator(
  'cancelRequestUpdateBasket'
);

export const cancelRequestClearBasket = makeActionCreator(
  'cancelRequestClearBasket'
);

export const fulfillClearBasket = makeActionCreator(
  'fulfillClearBasket',
  (recordClassName: string) => ({ recordClassName })
);

export const fulfillUpdateBasket = makeActionCreator(
  'fulfillUpdateBasket',
  (
    operation: BasketPatchIdsOperation,
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
  (step: Step) => ({ step })
);

export const requestBasketCounts = makeActionCreator('requestBasketCounts');

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
  (basketName: string, recordClassName: string, searchName: string) => ({
    basketName,
    recordClassName,
    searchName,
  })
);

export const saveBasketToStrategy = makeActionCreator(
  'saveBasketToStrategy',
  (basketName: string) => ({ basketName })
);

export const fulfillBasketStrategy = makeActionCreator(
  'fulfillBasketStrategy',
  (strategyId: number) => ({ strategyId })
);

export type Action = InferAction<
  | typeof requestUpdateBasket
  | typeof fulfillUpdateBasket
  | typeof cancelRequestUpdateBasket
  | typeof requestClearBasket
  | typeof fulfillClearBasket
  | typeof cancelRequestClearBasket
  | typeof requestAddStepToBasket
  | typeof fulfillAddStepToBasket
  | typeof requestBasketCounts
  | typeof fulfillBasketCounts
  | typeof requestBasketDetails
  | typeof fulfillBasketDetails
  | typeof saveBasketToStrategy
  | typeof fulfillBasketStrategy
>;
