import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { AttributesConfig, Pagination } from "wdk-client/Utils/WdkModel"
import { Answer } from "wdk-client/Utils/WdkModel";
import { Step } from "wdk-client/Utils/WdkUser";
import { PrimaryKey } from "wdk-client/Utils/WdkModel";

export const requestStep = makeActionCreator(
    'resultTableSummaryView/requestStep',
    (stepId: number) => ({ stepId })
    );

export const fulfillStep = makeActionCreator(
    'resultTableSummaryView/fulfillStep',
    (step: Step) => ({ step })
    );

export const requestColumnsConfig = makeActionCreator(
    'resultTableSummaryView/requestColumnConfig',
    (questionName: string) => ({ questionName })
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

export const viewPage = makeActionCreator(
    'resultTableSummaryView/viewPage',
    (page: number) => ({ page })
);

export const requestAnswer = makeActionCreator(
    'resultTableSummaryView/requestAnswer',
    (stepId: number, columnsConfig: AttributesConfig, pagination: Pagination) => ({ stepId, columnsConfig, pagination })
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
    | InferAction<typeof requestStep>
    | InferAction<typeof fulfillStep>
    | InferAction<typeof requestColumnsConfig>
    | InferAction<typeof fulfillColumnsConfig>
    | InferAction<typeof requestPageSize>
    | InferAction<typeof fulfillPageSize>
    | InferAction<typeof viewPage>
    | InferAction<typeof requestAnswer>
    | InferAction<typeof fulfillAnswer>
    | InferAction<typeof requestRecordsBasketStatus>
    | InferAction<typeof fulfillRecordsBasketStatus>

