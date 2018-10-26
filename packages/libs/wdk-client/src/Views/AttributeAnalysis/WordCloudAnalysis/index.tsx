import React from 'react';

import { createPlugin } from 'wdk-client/Utils/ClientPlugin';

import WordCloudAnalysis from 'wdk-client/Views/AttributeAnalysis/WordCloudAnalysis/WordCloudAnalysis';
import { observe, reduce, State } from 'wdk-client/Views/AttributeAnalysis/WordCloudAnalysis/WordCloudState';

export default createPlugin<State>({
  reduce,
  observe,
  render: (state, dispatch) =>
    <WordCloudAnalysis state={state} dispatch={dispatch}/>
})
