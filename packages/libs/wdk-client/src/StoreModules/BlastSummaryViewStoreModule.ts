import { get } from 'lodash/fp';
import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { Action } from 'wdk-client/Actions';
import { fulfillBlastSummaryReport, requestBlastSummaryReport, rejectBlastSummaryReport } from 'wdk-client/Actions/SummaryView/BlastSummaryViewActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { InferAction, mergeMapRequestActionsToEpic } from 'wdk-client/Utils/ActionCreatorUtils';
import { BlastSummaryViewReport } from 'wdk-client/Utils/WdkModel';
import { indexByActionProperty, IndexedState } from 'wdk-client/Utils/ReducerUtils';
import {getCustomReport} from 'wdk-client/Utils/WdkResult';
import { isServiceError } from 'wdk-client/Service/ServiceError';



export const key = 'blastSummaryView';
export type State = IndexedState<ViewState>;
export const reduce = indexByActionProperty(reduceView, get(['payload', 'viewId']));

type ViewState = {
  blastSummaryData?: BlastSummaryViewReport,
  errorMessage?: string;
};

const initialState: ViewState = {
  blastSummaryData: undefined,
};

function reduceView(state: ViewState = initialState, action: Action): ViewState {
  switch (action.type) {
    case requestBlastSummaryReport.type: {
      return initialState;
    }
    case fulfillBlastSummaryReport.type: {
      return { ...state, blastSummaryData: action.payload.blastInfo }
    }
    case rejectBlastSummaryReport.type: {
      return { ...state, errorMessage: action.payload.message }
    }
    default: {
      return state;
    }
  }
}

async function getBlastSummaryViewReport([requestAction]:  [InferAction<typeof requestBlastSummaryReport>], state$: Observable<RootState>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillBlastSummaryReport> | InferAction<typeof rejectBlastSummaryReport>> {
  const { resultType, viewId } = requestAction.payload;
  let formatting = { format: 'blastSummaryView', formatConfig: { attributes: ['summary', 'alignment']} };
  try {
    let report = await getCustomReport<BlastSummaryViewReport>(wdkService, resultType, formatting)
    return fulfillBlastSummaryReport(viewId, resultType, report);
  }
  catch (error) {
    wdkService.submitErrorIfNot500(error);
    const message = isServiceError(error) ? error.response : String(error);
    return rejectBlastSummaryReport(viewId, message);
  }
}

export const observe =
  combineEpics(
    mergeMapRequestActionsToEpic([requestBlastSummaryReport], getBlastSummaryViewReport,
      { areActionsNew: () => true })
  );
