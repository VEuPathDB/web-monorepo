import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { setActiveStrategy, openStrategy } from 'wdk-client/Actions/StrategyActions';
import { closeStrategyView, openStrategyView, setOpenedStrategiesVisibility } from 'wdk-client/Actions/StrategyViewActions';
import { Link } from 'wdk-client/Components';
import ResultPanelController from 'wdk-client/Controllers/ResultPanelController';
import StrategyPanelController from 'wdk-client/Controllers/StrategyPanelController';
import ResultPanelHeader from 'wdk-client/Views/Strategy/ResultPanelHeader';
import StrategyHeader from 'wdk-client/Views/Strategy/StrategyHeader';
import { RootState } from 'wdk-client/Core/State/Types';
import OpenedStrategies from 'wdk-client/Views/Strategy/OpenedStrategies';


interface Props {
  strategyId?: number;
  stepId?: number;
  dispatch: Dispatch
  openStrategies: number[];
  isOpenedStrategiesVisible: boolean;
}

function StrategyController({ stepId, strategyId, dispatch, openStrategies, isOpenedStrategiesVisible }: Props) {

  useEffect(() => {
    dispatch(openStrategyView());
    dispatch(setActiveStrategy(strategyId));
    if (strategyId) dispatch(openStrategy(strategyId));
    return () => {
      dispatch(closeStrategyView());
    }
  })

  return (
    <React.Fragment>
      <StrategyHeader/>
      <OpenedStrategies
        activeStrategyId={strategyId}
        openStrategies={openStrategies}
        isVisible={isOpenedStrategiesVisible}
        setVisibility={isVisible => dispatch(setOpenedStrategiesVisibility(isVisible))}
      />
      {strategyId == null &&
        <div>
          You have not selected a strategy. Please run a new search, or select a strategy from your <Link to="/workspace/strategies/all">history</Link>.
        </div>}
      {strategyId && <StrategyPanelController
        viewId="activeStrategyPanel"
        strategyId={strategyId}
        stepId={stepId}
      />}
      {/* stepId && <StepFiltersController
        strategyId={strategyId}
        stepId={stepId}
      /> */}
      <div style={{ position: 'relative', minHeight: '350px' }}>
        {strategyId && stepId && <ResultPanelController
          strategyId={strategyId}
          stepId={stepId}
          viewId="strategy"
          renderHeader={ResultPanelHeader}
        />}
      </div>
    </React.Fragment>
  );
}

function mapState(state: RootState) {
  const { openStrategies } = state.strategies;
  const { isOpenedStrategiesVisible } = state.strategyView;
  return { openStrategies, isOpenedStrategiesVisible };
}
export default connect(mapState)(StrategyController);
