import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { Action } from 'wdk-client/Actions';
import { fulfillBlastSummaryReport, requestBlastSummaryReport } from 'wdk-client/Actions/SummaryView/BlastSummaryViewActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { InferAction, mergeMapRequestActionsToEpic } from 'wdk-client/Utils/ActionCreatorUtils';
import { BlastSummaryViewReport } from 'wdk-client/Utils/WdkModel';



export const key = 'blastSummaryView';

export type State = {
  blastSummaryData?: BlastSummaryViewReport,
};

const initialState: State = {
  blastSummaryData: undefined,
};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
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
  return fulfillBlastSummaryReport(report);
}

export const observe =
  combineEpics(
    mergeMapRequestActionsToEpic([requestBlastSummaryReport], getBlastSummaryViewReport)
  );
