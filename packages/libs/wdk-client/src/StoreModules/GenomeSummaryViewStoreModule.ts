import { get } from 'lodash/fp';
import { combineEpics, StateObservable } from 'redux-observable';
import { Action } from 'wdk-client/Actions';
import {
  applyEmptyChromosomesFilter,
  fulfillGenomeSummaryReport,
  hideRegionDialog,
  requestGenomeSummaryReport,
  showRegionDialog,
  unapplyEmptyChromosomesFilter,
  rejectGenomeSummaryReport
} from 'wdk-client/Actions/SummaryView/GenomeSummaryViewActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import {
  InferAction,
  mergeMapRequestActionsToEpic
} from 'wdk-client/Utils/ActionCreatorUtils';
import { makeCommonErrorMessage } from 'wdk-client/Utils/Errors';
import { indexByActionProperty, IndexedState } from 'wdk-client/Utils/ReducerUtils';
import {
  GenomeSummaryViewReport,
  RecordClass
} from 'wdk-client/Utils/WdkModel';
import WdkService from 'wdk-client/Service/WdkService';
import {getCustomReport, getResultTypeDetails, ResultType} from 'wdk-client/Utils/WdkResult';

export const key = 'genomeSummaryView';
export type State = IndexedState<ViewState>;
export const reduce = indexByActionProperty(reduceView, get(['payload', 'viewId']));

type ViewState = {
  errorMessage?: string;
  genomeSummaryData?: GenomeSummaryViewReport;
  recordClass?: RecordClass;
  regionDialogVisibilities: Record<string, boolean>;
  emptyChromosomeFilterApplied: boolean;
};

const initialState: ViewState = {
  genomeSummaryData: undefined,
  recordClass: undefined,
  regionDialogVisibilities: {},
  emptyChromosomeFilterApplied: false
};

function reduceView(state: ViewState = initialState, action: Action): ViewState {
  switch (action.type) {
    case requestGenomeSummaryReport.type: {
      return initialState;
    }
    case fulfillGenomeSummaryReport.type: {
      return {
        ...state,
        genomeSummaryData: action.payload.genomeSummaryViewReport,
        recordClass: action.payload.recordClass
      };
    }
    case rejectGenomeSummaryReport.type: {
      return {
        ...state,
        errorMessage: action.payload.message
      }
    }
    case showRegionDialog.type: {
      return {
        ...state,
        regionDialogVisibilities: {
          ...state.regionDialogVisibilities,
          [action.payload.regionId]: true
        }
      };
    }
    case hideRegionDialog.type: {
      return {
        ...state,
        regionDialogVisibilities: {
          ...state.regionDialogVisibilities,
          [action.payload.regionId]: false
        }
      };
    }
    case applyEmptyChromosomesFilter.type: {
      return { ...state, emptyChromosomeFilterApplied: true };
    }
    case unapplyEmptyChromosomesFilter.type: {
      return { ...state, emptyChromosomeFilterApplied: false };
    }
    default: {
      return state;
    }
  }
}

function getFormatFromRecordClassName(recordClassName: string): string {
  switch (recordClassName) {
    case 'transcript':
      return 'geneGenomeSummaryView';
    case 'genomic-segment':
      return 'dynamicSpanSummaryView';
    default:
      throw new Error('This step cannot use this summary view, it is the wrong record class: ' +
        recordClassName);
  }
}

async function getRecordClassAndFormat(
  resultType: ResultType,
  wdkService: WdkService
): Promise<[string, RecordClass]> {
  const resultTypeDetails = await getResultTypeDetails(wdkService, resultType);
  const recordClass = await wdkService.findRecordClass(resultTypeDetails.recordClassName);
  return [
    getFormatFromRecordClassName(resultTypeDetails.recordClassName),
    recordClass
  ];
}

async function getGenomeSummaryViewReport(
  [requestAction]: [InferAction<typeof requestGenomeSummaryReport>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillGenomeSummaryReport> | InferAction<typeof rejectGenomeSummaryReport>> {
  let [format, recordClass] = await getRecordClassAndFormat(
    requestAction.payload.resultType,
    wdkService
  );
  try {
    let report = await getCustomReport<GenomeSummaryViewReport>(
      wdkService,
      requestAction.payload.resultType,
      { format: format, formatConfig: {} }
    );
    return fulfillGenomeSummaryReport(requestAction.payload.viewId, report, recordClass);
  }
  catch (error) {
    wdkService.submitErrorIfUndelayedAndNot500(error);
    const message = makeCommonErrorMessage(error);
    return rejectGenomeSummaryReport(requestAction.payload.viewId, message);
  }
}

export const observe = combineEpics(
  mergeMapRequestActionsToEpic([requestGenomeSummaryReport], getGenomeSummaryViewReport)
);
