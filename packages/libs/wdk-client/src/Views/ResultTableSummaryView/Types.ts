import {
  AttributeSortingSpec,
  PrimaryKey,
  RecordInstance,
} from '../../Utils/WdkModel';
import { ResultType } from '../../Utils/WdkResult';
import { BasketPatchIdsOperation } from '../../Service/Mixins/BasketsService';

// Types that are shared by ResultTableSummaryView Components

export interface Action {
  element:
    | React.ReactElement
    | ((selection: RecordInstance[]) => React.ReactElement);
}

export type BasketStatus = 'yes' | 'no' | 'loading';

export type BasketStatusArray = BasketStatus[];

// Callback functions
// ==================

export type ShowLoginWarning = (featureDescription: string) => void;

export type RequestSortingUpdate = (
  sorting: AttributeSortingSpec[],
  searchName: string
) => void;

export type RequestColumnsChoiceUpdate = (
  columns: string[],
  searchName: string
) => void;

export type RequestUpdateBasket = (
  operation: BasketPatchIdsOperation,
  recordClass: string,
  primaryKeys: PrimaryKey[]
) => void;

export type RequestAddStepToBasket = (
  stepId: number,
  clearFirst: boolean
) => void;

export type RequestPageSizeUpdate = (pageSize: number) => void;

export type ViewPageNumber = (pageNumber: number) => void;

export type UpdateInBasketFilter = (enabled: boolean) => void;

export type ShowHideAddColumnsDialog = (show: boolean) => void;

export type UpdateColumnsDialogSelection = (attributes: string[]) => void;

export type UpdateColumnsDialogSearchString = (searchString: string) => void;

export type UpdateColumnsDialogExpandedNodes = (nodes: string[]) => void;

export type OpenAttributeAnalysis = (
  reporterName: string,
  resultType: ResultType
) => void;

export type CloseAttributeAnalysis = (
  reporterName: string,
  resultType: ResultType
) => void;

export type UpdateSelectedIds = (ids: string[]) => void;
