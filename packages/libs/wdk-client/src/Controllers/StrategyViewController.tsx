import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import StrategyPanelController from 'wdk-client/Controllers/StrategyPanelController';
import StrategyHeader from 'wdk-client/Views/Strategy/StrategyHeader';
import ResultPanelHeader from 'wdk-client/Views/Strategy/ResultPanelHeader';
import ResultPanelController from 'wdk-client/Controllers/ResultPanelController';
import StepFiltersController from 'wdk-client/Controllers/StepFiltersController';
import { closeStrategyView, openStrategyView } from 'wdk-client/Actions/StrategyViewActions';
import { Link } from 'wdk-client/Components';

interface Props {
  strategyId?: number;
  stepId?: number;
  action?: string;
  dispatch: Dispatch
}

function StrategyController({ stepId, strategyId, action, dispatch }: Props) {

  useEffect(() => {
    dispatch(openStrategyView());
    return () => {
      dispatch(closeStrategyView());
    }
  })

  return (
    <React.Fragment>
      <StrategyHeader/>
      {strategyId == null &&
        <div>
          You have not selected a strategy. Please run a new search, or select a strategy from your <Link to="/workspace/strategies/all">history</Link>.
        </div>}
      {strategyId && <StrategyPanelController
        viewId="active"
        strategyId={strategyId}
        stepId={stepId}
        action={action}
      />}
      {/* stepId && <StepFiltersController
        strategyId={strategyId}
        stepId={stepId}
      /> */}
      {strategyId && stepId && <ResultPanelController
        strategyId={strategyId}
        stepId={stepId}
        viewId="strategy"
        renderHeader={ResultPanelHeader}
      />}
    </React.Fragment>
  );
}

export default connect()(StrategyController);
