import { AttributeSortingSpec, PrimaryKey } from "wdk-client/Utils/WdkModel";

// Types that are shared by ResultTableSummaryView Components

export interface Action {
  element: React.ReactType | ((selection: string[]) => React.ReactType);
}

export type BasketStatus = 'yes' | 'no' | 'loading';

export type BasketStatusArray = BasketStatus[];


// Callback functions
// ==================

export type ShowLoginWarning = (featureDescription: string) => void;

export type RequestSortingUpdate = (
  sorting: AttributeSortingSpec[],
  questionName: string
) => void;

export type RequestColumnsChoiceUpdate = (columns: string[], questionName: string) => void;

export type RequestUpdateBasket = (
  operation: 'add' | 'remove',
  recordClass: string,
  primaryKeys: PrimaryKey[]
) => void;

export type RequestAddStepToBasket= (
  stepId: number
) => void;

export type RequestPageSizeUpdate = (pageSize: number) => void;

export type ViewPageNumber = (pageNumber: number) => void;

export type ShowHideAddColumnsDialog = (show: boolean) => void;

export type UpdateColumnsDialogSelection = (attributes: string[]) => void;

export type UpdateColumnsDialogExpandedNodes = (nodes: string[]) => void;

export type OpenAttributeAnalysis = (reporterName: string, stepId: number) => void;

export type CloseAttributeAnalysis = (reporterName: string, stepId: number) => void;

export type UpdateSelectedIds = (ids: string[]) => void;