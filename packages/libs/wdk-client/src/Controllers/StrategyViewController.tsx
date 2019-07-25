import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { closeStrategyView, openStrategyView, setOpenedStrategiesVisibility, setActiveStrategy } from 'wdk-client/Actions/StrategyViewActions';
import { Link } from 'wdk-client/Components';
import ResultPanelController from 'wdk-client/Controllers/ResultPanelController';
import {StepFiltersController} from 'wdk-client/Controllers';
import StrategyPanelController from 'wdk-client/Controllers/StrategyPanelController';
import { RootState } from 'wdk-client/Core/State/Types';
import OpenedStrategies from 'wdk-client/Views/Strategy/OpenedStrategies';
import ResultPanelHeader from 'wdk-client/Views/Strategy/ResultPanelHeader';
import StrategyHeader from 'wdk-client/Views/Strategy/StrategyHeader';

interface OwnProps {
  strategyId?: number;
  stepId?: number;
}

interface MappedProps {
  openedStrategies?: number[];
  isOpenedStrategiesVisible?: boolean;
}

interface DispatchProps {
  dispatch: Dispatch
}

type Props = OwnProps & DispatchProps & MappedProps;

function StrategyViewController({ stepId, strategyId, dispatch, openedStrategies, isOpenedStrategiesVisible }: Props) {

  useEffect(() => {
    dispatch(openStrategyView());
    return () => {
      dispatch(closeStrategyView());
    }
  }, [])

  useEffect(() => {
    dispatch(setActiveStrategy(strategyId ? { strategyId, stepId } : undefined));
  }, [ stepId, strategyId ])

  return (
    <React.Fragment>
      <StrategyHeader/>
      {openedStrategies != null && <OpenedStrategies
        activeStrategyId={strategyId}
        openStrategies={openedStrategies}
        isVisible={isOpenedStrategiesVisible || false}
        setVisibility={isVisible => dispatch(setOpenedStrategiesVisibility(isVisible))}
      />}
      {strategyId == null &&
        <div>
          You have not selected a strategy. Please run a new search, or select a strategy from your <Link to="/workspace/strategies/all">history</Link>.
        </div>}
      {strategyId && <StrategyPanelController
        viewId="activeStrategyPanel"
        strategyId={strategyId}
        stepId={stepId}
      />}
      {strategyId && stepId && <StepFiltersController
        strategyId={strategyId}
        stepId={stepId}
      />}
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

function mapState(state: RootState): MappedProps {
  const { openedStrategies, isOpenedStrategiesVisible } = state.strategyView;
  return { openedStrategies, isOpenedStrategiesVisible };
}

export default connect(mapState)(StrategyViewController);
