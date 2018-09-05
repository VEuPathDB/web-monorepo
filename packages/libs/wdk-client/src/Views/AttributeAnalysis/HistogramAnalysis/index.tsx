import React from 'react';

import { createPlugin } from '../../../Utils/ClientPlugin';

import HistogramAnalysis, { ModuleState } from './HistogramAnalysis';
import { observe, reduce, State } from './HistogramState';

export default createPlugin<State>({
  reduce,
  observe,
  render: (state, dispatch) =>
    <HistogramAnalysis state={state} dispatch={dispatch} />,
})