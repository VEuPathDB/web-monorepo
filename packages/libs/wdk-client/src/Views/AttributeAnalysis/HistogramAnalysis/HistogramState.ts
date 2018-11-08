import { makeReduce, observe, State as BaseState } from 'wdk-client/Views/AttributeAnalysis/BaseAttributeAnalysis';
import {
  SetBinSizeAction,
  EnableLogScaleXAxisAction,
  EnableLogScaleYAxisAction,
  SET_BIN_SIZE,
  ENABLE_LOG_SCALE_X_AXIS,
  ENABLE_LOG_SCALE_Y_AXIS
} from 'wdk-client/Views/AttributeAnalysis/HistogramAnalysis/HistogramActions';
import { EndAttributeReportRequestSuccessAction } from 'wdk-client/Actions/AttributeAnalysisActions';

type HistogramAction =
  | EndAttributeReportRequestSuccessAction
  | EnableLogScaleXAxisAction
  | EnableLogScaleYAxisAction
  | SetBinSizeAction

type HistogramState = {
  binSize?: number;
  logXAxis: boolean;
  logYAxis: boolean;
}

export type State = BaseState<'attrValue' | 'recordCount', HistogramState>;

const defaultState: HistogramState = {
  logXAxis: false,
  logYAxis: false
}

function reduceHistogram(state: HistogramState = defaultState, action: HistogramAction): HistogramState {
  switch (action.type) {
    case SET_BIN_SIZE:
      return { ...state, binSize: action.payload.size };
    case ENABLE_LOG_SCALE_X_AXIS:
      return { ...state, logXAxis: action.payload.enable, binSize: undefined };
    case ENABLE_LOG_SCALE_Y_AXIS:
      return { ...state, logYAxis: action.payload.enable };
    default:
      return state;
  }
}

export const reduce = makeReduce<
  'attrValue' | 'recordCount',
  HistogramState,
  HistogramAction
>('attrValue', reduceHistogram);

export { observe }
