import React from 'react';

import StrategyPanelController from 'wdk-client/Controllers/StrategyPanelController';
import StrategyHeader from 'wdk-client/Views/Strategy/StrategyHeader';
import { ResultPanelController } from 'wdk-client/Controllers';
import ResultPanelHeader from 'wdk-client/Views/Strategy/ResultPanelHeader';

interface Props {
  strategyId: number;
  stepId?: number;
  action?: string;
}

function StrategyController({ stepId, strategyId, action }: Props) {
  return (
    <React.Fragment>
      <StrategyHeader/>
      <StrategyPanelController
        strategyId={strategyId}
        stepId={stepId}
        action={action}
      />
      {stepId && <ResultPanelController
        strategyId={strategyId}
        stepId={stepId}
        viewId="strategy"
        renderHeader={ResultPanelHeader}
      />}
    </React.Fragment>
  );
}

export default StrategyController;
