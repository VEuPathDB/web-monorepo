import React from 'react';

import { createPlugin } from '../../../Utils/ClientPlugin';

import WordCloudAnalysis from './WordCloudAnalysis';
import { observe, reduce, State } from './WordCloudState';

export default createPlugin<State>({
  reduce,
  observe,
  render: (state, dispatch) =>
    <WordCloudAnalysis state={state} dispatch={dispatch}/>
})
