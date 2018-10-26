import React from 'react';

import { createPlugin } from 'wdk-client/Utils/ClientPlugin';

import HistogramAnalysis, { ModuleState } from 'wdk-client/Views/AttributeAnalysis/HistogramAnalysis/HistogramAnalysis';
import { observe, reduce, State } from 'wdk-client/Views/AttributeAnalysis/HistogramAnalysis/HistogramState';

export default createPlugin<State>({
  reduce,
  observe,
  render: (state, dispatch) =>
    <HistogramAnalysis state={state} dispatch={dispatch} />,
})