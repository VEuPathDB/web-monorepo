import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { AttributesConfig } from "wdk-client/Utils/WdkModel"
import { Answer } from "wdk-client/Utils/WdkModel";
import { PrimaryKey } from "wdk-client/Utils/WdkModel";

export const requestColumnsConfig = makeActionCreator(
    'resultTableSummaryView/requestColumnConfig',
    (stepId: number) => ({ stepId })
    );

export const fulfillColumnsConfig = makeActionCreator(
    'resultTableSummaryView/fulfillColumnConfig',
    (columnsConfig: AttributesConfig) => ({ columnsConfig })
    );

export const requestPageSize = makeActionCreator(
    'resultTableSummaryView/requestPageSize',
    () => ({ })
    );

export const fulfillPageSize = makeActionCreator(
    'resultTableSummaryView/fulfillPageSize',
    (pageSize: number) => ({pageSize })
    );

export const requestAnswer = makeActionCreator(
    'resultTableSummaryView/requestAnswer',
    (stepId: number, columnsConfig: AttributesConfig) => ({stepId, columnsConfig })
    );

export const fulfillAnswer = makeActionCreator(
    'resultTableSummaryView/fulfillAnswer',
    (answer: Answer) => ({answer })
    );

export const requestRecordsBasketStatus = makeActionCreator(
    'resultTableSummaryView/requestRecordsBasketStatus',
    (recordClassName: string, basketQuery: PrimaryKey[]) => ({recordClassName, basketQuery })
    );

export const fulfillRecordsBasketStatus = makeActionCreator(
    'resultTableSummaryView/fulfillRecordsBasketStatus',
    (basketStatus: boolean[]) => ({basketStatus })
    );

export type Action =
  | InferAction<typeof requestColumnsConfig>
  | InferAction<typeof fulfillColumnsConfig>
  | InferAction<typeof requestPageSize>
  | InferAction<typeof fulfillPageSize>
  | InferAction<typeof requestAnswer>
  | InferAction<typeof fulfillAnswer>
  | InferAction<typeof requestRecordsBasketStatus>
  | InferAction<typeof fulfillRecordsBasketStatus>

