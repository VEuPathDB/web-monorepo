import { get } from 'lodash/fp';
import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';

import { Action as WdkAction } from '@veupathdb/wdk-client/lib/Actions';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import {
  InferAction,
  mergeMapRequestActionsToEpic,
} from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { makeCommonErrorMessage } from '@veupathdb/wdk-client/lib/Utils/Errors';
import {
  indexByActionProperty,
  IndexedState,
} from '@veupathdb/wdk-client/lib/Utils/ReducerUtils';
import { getCustomReport } from '@veupathdb/wdk-client/lib/Utils/WdkResult';

import {
  Action as BlastSummaryViewAction,
  fulfillBlastSummaryReport,
  requestBlastSummaryReport,
  rejectBlastSummaryReport,
} from '../Actions/BlastSummaryViewActions';
import { BlastSummaryViewReport } from '../Utils/types';

export const key = 'blastSummaryView';
export type State = IndexedState<ViewState>;
export type Action = WdkAction | BlastSummaryViewAction;
export const reduce = indexByActionProperty(
  reduceView,
  get(['payload', 'viewId'])
);

type ViewState = {
  blastSummaryData?: BlastSummaryViewReport;
  errorMessage?: string;
};

const initialState: ViewState = {
  blastSummaryData: undefined,
};

function reduceView(
  state: ViewState = initialState,
  action: Action
): ViewState {
  switch (action.type) {
    case requestBlastSummaryReport.type: {
      return initialState;
    }
    case fulfillBlastSummaryReport.type: {
      return { ...state, blastSummaryData: action.payload.blastInfo };
    }
    case rejectBlastSummaryReport.type: {
      return { ...state, errorMessage: action.payload.message };
    }
    default: {
      return state;
    }
  }
}

async function getBlastSummaryViewReport(
  [requestAction]: [InferAction<typeof requestBlastSummaryReport>],
  state$: Observable<RootState>,
  { wdkService }: EpicDependencies
): Promise<
  | InferAction<typeof fulfillBlastSummaryReport>
  | InferAction<typeof rejectBlastSummaryReport>
> {
  const { resultType, viewId } = requestAction.payload;
  let formatting = {
    format: 'blastSummaryView',
    formatConfig: { attributes: ['summary', 'alignment'] },
  };
  try {
    let report = await getCustomReport<BlastSummaryViewReport>(
      wdkService,
      resultType,
      formatting
    );
    return fulfillBlastSummaryReport(viewId, resultType, report);
  } catch (error: any) {
    wdkService.submitErrorIfUndelayedAndNot500(error);
    const message = makeCommonErrorMessage(error);
    return rejectBlastSummaryReport(viewId, message);
  }
}

export const observe = combineEpics(
  mergeMapRequestActionsToEpic(
    [requestBlastSummaryReport],
    getBlastSummaryViewReport,
    { areActionsNew: () => true }
  )
);
