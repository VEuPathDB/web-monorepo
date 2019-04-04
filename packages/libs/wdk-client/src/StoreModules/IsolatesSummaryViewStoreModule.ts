import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { Action } from 'wdk-client/Actions';
import {
  fulfillIsolatesSummaryReport,
  requestIsolatesSummaryReport
} from 'wdk-client/Actions/SummaryView/IsolatesSummaryViewActions';
import { EpicDependencies } from 'wdk-client/Core/Store';
import {
  InferAction,
  mergeMapRequestActionsToEpic
} from 'wdk-client/Utils/ActionCreatorUtils';
import { IsolatesSummaryViewReport } from 'wdk-client/Utils/WdkModel';

export const key = 'isolatesSummaryView';

export type State = {
  isolatesSummaryData?: IsolatesSummaryViewReport;
};

const initialState: State = {
  isolatesSummaryData: undefined
};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case fulfillIsolatesSummaryReport.type: {
      return {
        ...state,
        isolatesSummaryData: action.payload.isolatesSummaryViewReport
      };
    }
    default: {
      return state;
    }
  }
}

async function getIsolatesSummaryViewReport(
  [requestAction]: [InferAction<typeof requestIsolatesSummaryReport>],
  state$: Observable<State>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillIsolatesSummaryReport>> {
  let report = await wdkService.getStepAnswer(requestAction.payload.stepId, {
    format: 'geoIsolateSummaryView'
  });
  return fulfillIsolatesSummaryReport(report);
}

export const observe = combineEpics(
  mergeMapRequestActionsToEpic(
    [requestIsolatesSummaryReport],
    getIsolatesSummaryViewReport
  )
);
