import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { withRouter, RouteComponentProps } from 'react-router';

import { requestStrategy } from 'wdk-client/Actions/StrategyActions';
import ResultPanelController from 'wdk-client/Controllers/ResultPanelController';
import StrategyPanelController from 'wdk-client/Controllers/StrategyPanelController';
import StrategyHeader from 'wdk-client/Views/Strategy/StrategyHeader';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { RootState } from 'wdk-client/Core/State/Types';

interface OwnProps {
  strategyId: number;
  stepId?: number;
  action?: string;
}

interface MappedDispatch {
  requestStrategy: (id: number) => void;
}

interface MappedState {
  strategy?: StrategyDetails;
}

type Props = OwnProps & MappedDispatch & MappedState & RouteComponentProps<any>;

function StrategyController({ stepId, strategyId, strategy, action, requestStrategy, history}: Props) {
  
  useEffect(() => {
    if (stepId == null) {
      if (strategy == null) requestStrategy(strategyId);
      else history.replace(`/workspace/strategies/${strategy.strategyId}/${strategy.rootStepId}`);
    }
  }, [strategyId, stepId, strategy, history, requestStrategy]);

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
      />}
    </React.Fragment>
  );
}

function mapState(state: RootState, props: OwnProps): MappedState {
  const strategyEntry = state.strategies.strategies[props.strategyId];
  return {
    strategy: strategyEntry && strategyEntry.status === 'success' ? strategyEntry.strategy : undefined
  };
}

function mapDispatch(dispatch: Dispatch): MappedDispatch {
  return bindActionCreators({
    requestStrategy
  }, dispatch);
}

export default connect(mapState, mapDispatch)(withRouter(StrategyController));
