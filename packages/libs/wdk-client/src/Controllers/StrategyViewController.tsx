import { castArray, last } from 'lodash';
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

const STRATEGY_PANEL_VIEW_ID = 'activeStrategyPanel';

function StrategyViewController(props: Props) {
  const { stepId, strategyId, activeStrategy, dispatch, openedStrategies, isOpenedStrategiesVisible } = props;

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
    <>
      {/* <StrategyPanelWithOpenedPanel {...props}/> */}
      <StrategyPanelWithToggle {...props}/>
      <div style={{ position: 'relative', minHeight: '350px' }}>
        {strategyId && stepId && <ResultPanelController
          strategyId={strategyId}
          stepId={stepId}
          viewId="strategy"
          renderHeader={props => (
            <>
              <ResultPanelHeader reviseViewId={STRATEGY_PANEL_VIEW_ID} {...props}/>
              <StepFiltersController
                strategyId={strategyId}
                stepId={stepId}
              />
            </>
          )}
        />}
      </div>
    </>
  );
}

function mapState(state: RootState): MappedProps {
  const { isOpenedStrategiesVisible } = state.strategyWorkspace;
  return { isOpenedStrategiesVisible };
}

export default connect(mapState)(StrategyViewController);

function StrategyPanelWithOpenedPanel(props: Props) {
  const { stepId, strategyId, dispatch, openedStrategies, isOpenedStrategiesVisible } = props;
  return (
    <>
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
        isActive
        viewId={STRATEGY_PANEL_VIEW_ID}
        strategyId={strategyId}
        stepId={stepId}
      />}
    </>
  );
}

function StrategyPanelWithToggle(props: Props) {
  const { stepId, strategyId, dispatch, openedStrategies = [], isOpenedStrategiesVisible } = props;
  const toggleId = "openedStrategiesPanelToggle";
  const strategiesToShow = isOpenedStrategiesVisible ? openedStrategies
    : strategyId != null ? [ strategyId ]
    : [];
  return (
    <>
      {openedStrategies.length > 1 &&
        <>
          <input id={toggleId} type="checkbox" checked={isOpenedStrategiesVisible} onChange={event => dispatch(setOpenedStrategiesVisibility(event.target.checked))}/> <label htmlFor={toggleId}>Show all opened strategies</label>
        </>
      }
      <div className="OpenedStrategiesPanel">
        {strategiesToShow.map(id => (
          <StrategyPanelController
            key={id}
            isActive={id === strategyId}
            showCloseButton
            viewId={id === strategyId ? STRATEGY_PANEL_VIEW_ID : `inactiveStrategyPanel__${id}`}
            strategyId={id}
            stepId={id === strategyId ? stepId : undefined}
          />
        ))}
      </div>
      {strategyId == null &&
        <div>
          You have not selected a strategy. Please run a new search, or select a strategy from your <Link to="/workspace/strategies/all">history</Link>.
        </div>
      }
      {strategyId != null && stepId == null &&
        <div>
          Select a search above to see the results.
        </div>
      }
    </>
  )
}
