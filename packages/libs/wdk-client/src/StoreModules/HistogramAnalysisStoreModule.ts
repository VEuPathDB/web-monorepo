import {
  setBinSize,
  enableLogScaleXAxis,
  enableLogScaleYAxis,
  openView,
  closeView,
} from '../Actions/HistogramAnalysisActions';
import { Action } from '../Actions';
import {
  InferAction,
  takeEpicInWindow,
  switchMapRequestActionsToEpic,
} from '../Utils/ActionCreatorUtils';
import { requestAttributeReport } from '../Actions/AttributeAnalysisActions';

type HistogramState = {
  binSize?: number;
  logXAxis: boolean;
  logYAxis: boolean;
};

export const key = 'histogramAnalysis';

export type State = HistogramState;

const defaultState: HistogramState = {
  logXAxis: false,
  logYAxis: false,
};

export function reduce(
  state: HistogramState = defaultState,
  action: Action
): HistogramState {
  switch (action.type) {
    case openView.type:
      return defaultState;
    case setBinSize.type:
      return { ...state, binSize: action.payload.size };
    case enableLogScaleXAxis.type:
      return { ...state, logXAxis: action.payload.enable, binSize: undefined };
    case enableLogScaleYAxis.type:
      return { ...state, logYAxis: action.payload.enable };
    default:
      return state;
  }
}

async function getReport([
  {
    payload: { reporterName, resultType },
  },
]: [InferAction<typeof openView>]) {
  return requestAttributeReport(reporterName, resultType, {});
}

export const observe = takeEpicInWindow(
  { startActionCreator: openView, endActionCreator: closeView },
  switchMapRequestActionsToEpic([openView], getReport)
);
