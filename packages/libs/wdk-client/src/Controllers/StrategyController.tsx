import React from 'react';

import ResultPanelController from 'wdk-client/Controllers/ResultPanelController';
import StrategyPanelController from 'wdk-client/Controllers/StrategyPanelController';

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
      <StrategyPanelController
        strategyId={props.strategyId}
        stepId={props.stepId}
      />
      <ResultPanelController 
        strategyId={props.strategyId}
        stepId={props.stepId}
        viewId="strategy"
      />
    </React.Fragment>
  );
}
