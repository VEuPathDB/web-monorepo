import { last } from 'lodash';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { setOpenedStrategiesVisibility, setActiveStrategy } from 'wdk-client/Actions/StrategyWorkspaceActions';
import { Link } from 'wdk-client/Components';
import ResultPanelController from 'wdk-client/Controllers/ResultPanelController';
import {StepFiltersController} from 'wdk-client/Controllers';
import StrategyPanelController from 'wdk-client/Controllers/StrategyPanelController';
import { RootState } from 'wdk-client/Core/State/Types';
import OpenedStrategies from 'wdk-client/Views/Strategy/OpenedStrategies';
import ResultPanelHeader from 'wdk-client/Views/Strategy/ResultPanelHeader';
import { transitionToInternalPage } from 'wdk-client/Actions/RouterActions';

interface OwnProps {
  strategyId?: number;
  stepId?: number;
  openedStrategies?: number[];
  activeStrategy?: { strategyId: number, stepId?: number };
}

interface MappedProps {
  isOpenedStrategiesVisible?: boolean;
}

interface DispatchProps {
  dispatch: Dispatch
}

type Props = OwnProps & DispatchProps & MappedProps;

function StrategyViewController({ stepId, strategyId, activeStrategy, dispatch, openedStrategies, isOpenedStrategiesVisible }: Props) {

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
    else if (openedStrategies) {
      const lastOpened = last(openedStrategies);
      if (lastOpened) {
        dispatch(transitionToInternalPage(`/workspace/strategies/${lastOpened}`));
      }
    }
  }, [ stepId, strategyId, activeStrategy, openedStrategies ]);

  return (
    <React.Fragment>
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
  const { isOpenedStrategiesVisible } = state.strategyWorkspace;
  return { isOpenedStrategiesVisible };
}

export default connect(mapState)(StrategyViewController);
