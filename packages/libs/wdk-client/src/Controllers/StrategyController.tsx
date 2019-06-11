import React from 'react';

import ResultPanelController from './ResultPanelController';

interface Props {
  strategyId: number;
  stepId?: number;
}

export default function StrategyController(props: Props) {
  if (props.stepId == null) return (
    <div>No step id specified</div>
  );

  return (
    <React.Fragment>
      <ResultPanelController 
        strategyId={props.strategyId}
        stepId={props.stepId}
        viewId="strategy"
      />
    </React.Fragment>
  );
}
