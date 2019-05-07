import { get } from 'lodash/fp';
import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { Action } from 'wdk-client/Actions';
import { fulfillBlastSummaryReport, requestBlastSummaryReport } from 'wdk-client/Actions/SummaryView/BlastSummaryViewActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { InferAction, mergeMapRequestActionsToEpic } from 'wdk-client/Utils/ActionCreatorUtils';
import { BlastSummaryViewReport } from 'wdk-client/Utils/WdkModel';
import { indexByActionProperty, IndexedState } from 'wdk-client/Utils/ReducerUtils';



export const key = 'blastSummaryView';
export type State = IndexedState<ViewState>;
export const reduce = indexByActionProperty(reduceView, get(['payload', 'stepId']));

type ViewState = {
  blastSummaryData?: BlastSummaryViewReport,
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
    default: {
      return state;
    }
  }
}

async function getBlastSummaryViewReport([requestAction]:  [InferAction<typeof requestBlastSummaryReport>], state$: Observable<RootState>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillBlastSummaryReport>> {
  let formatting = { format: 'blastSummaryView', formatConfig: { attributes: ['summary', 'alignment']} };
  let report = await wdkService.getStepAnswer(requestAction.payload.stepId, formatting)
  return fulfillBlastSummaryReport(requestAction.payload.stepId, report);
}

export const observe =
  combineEpics(
    mergeMapRequestActionsToEpic([requestBlastSummaryReport], getBlastSummaryViewReport,
      { areActionsNew: () => true })
  );
