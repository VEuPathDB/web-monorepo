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
import StrategyNotifications from 'wdk-client/Views/Strategy/StrategyNotifications';
import { transitionToInternalPage } from 'wdk-client/Actions/RouterActions';

interface OwnProps {
  strategyId?: number;
  stepId?: number;
}

interface MappedProps {
  openedStrategies?: number[];
  isOpenedStrategiesVisible?: boolean;
  notifications: Record<string, string | undefined>;
  activeStrategy?: { strategyId: number, stepId?: number };
}

interface DispatchProps {
  dispatch: Dispatch
}

type Props = OwnProps & DispatchProps & MappedProps;

function StrategyViewController({ stepId, strategyId, activeStrategy, dispatch, openedStrategies, isOpenedStrategiesVisible, notifications }: Props) {

  useEffect(() => {
    dispatch(openStrategyView());
    return () => {
      dispatch(closeStrategyView());
    }
  }, [])

  useEffect(() => {
    if (strategyId && (
      activeStrategy == null ||
      activeStrategy.strategyId !== strategyId ||
      activeStrategy.stepId !== stepId
    )) {
      dispatch(setActiveStrategy({ strategyId, stepId }));
    }
    else if (activeStrategy) {
      const subPath = `${activeStrategy.strategyId}` + (activeStrategy.stepId ? `/${activeStrategy.stepId}` : ``);
      dispatch(transitionToInternalPage(`/workspace/strategies/${subPath}`));
    }
  }, [ stepId, strategyId, activeStrategy ]);

  return (
    <React.Fragment>
      <StrategyNotifications notifications={notifications}/>
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
      <div style={{ position: 'relative', minHeight: '350px' }}>
        {strategyId && stepId && <ResultPanelController
          strategyId={strategyId}
          stepId={stepId}
          viewId="strategy"
          renderHeader={props => (
            <React.Fragment>
              <ResultPanelHeader {...props}/>
              <StepFiltersController
                strategyId={strategyId}
                stepId={stepId}
              />
            </React.Fragment>
          )}
        />}
      </div>
    </React.Fragment>
  );
}

function mapState(state: RootState): MappedProps {
  const { activeStrategy, openedStrategies, isOpenedStrategiesVisible, notifications } = state.strategyView;
  return { activeStrategy, openedStrategies, isOpenedStrategiesVisible, notifications };
}

export default connect(mapState)(StrategyViewController);
