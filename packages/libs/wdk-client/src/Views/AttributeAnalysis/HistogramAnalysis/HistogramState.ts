import { matchAction } from '../../../Utils/ReducerUtils';

import { makeReduce, observe, State as BaseState } from '../BaseAttributeAnalysis';
import { SetBinSize, SetLogScaleXAxis, SetLogScaleYAxis } from './HistogramActions';

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

const reduceHistogram = matchAction(defaultState,
  [SetBinSize, (state, binSize): HistogramState => ({ ...state, binSize })],
  [SetLogScaleXAxis, (state, logXAxis): HistogramState => ({ ...state, logXAxis, binSize: undefined })],
  [SetLogScaleYAxis, (state, logYAxis): HistogramState => ({ ...state, logYAxis })],
)

export const reduce =
  makeReduce<'attrValue' | 'recordCount', HistogramState>('attrValue', reduceHistogram);

export { observe }
