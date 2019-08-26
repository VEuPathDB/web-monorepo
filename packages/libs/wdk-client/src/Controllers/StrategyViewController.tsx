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
import {Step} from 'wdk-client/Utils/WdkUser';
import {requestStrategy} from 'wdk-client/Actions/StrategyActions';
import {createSelector} from 'reselect';
import {ResultType, StepResultType} from 'wdk-client/Utils/WdkResult';

interface OwnProps {
  strategyId?: number;
  stepId?: number;
  openedStrategies?: number[];
  activeStrategy?: { strategyId: number, stepId?: number };
}

interface MappedProps {
  isOpenedStrategiesVisible?: boolean;
  resultType?: StepResultType;
}

interface DispatchProps {
  dispatch: Dispatch
}

type Props = OwnProps & DispatchProps & MappedProps;

const STRATEGY_PANEL_VIEW_ID = 'activeStrategyPanel';

function StrategyViewController(props: Props) {
  const { stepId, strategyId, resultType, activeStrategy, dispatch, openedStrategies } = props;

  useEffect(() => {
    // XXX Move this logic to store module?
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

  useEffect(() => {
    if (strategyId) {
      dispatch(requestStrategy(strategyId));
    }
  }, [strategyId]);

  return (
    <>
      {/* <StrategyPanelWithOpenedPanel {...props}/> */}
      <StrategyPanelWithToggle {...props}/>
      <div style={{ position: 'relative', minHeight: '350px' }}>
        {resultType && <ResultPanelController
          resultType={resultType}
          viewId="strategy"
          renderHeader={props => (
            <>
              <ResultPanelHeader reviseViewId={STRATEGY_PANEL_VIEW_ID} {...props}/>
              <StepFiltersController
                strategyId={resultType.step.strategyId}
                stepId={resultType.step.id}
              />
            </>
          )}
        />}
      </div>
    </>
  );
}

const getResultType = createSelector<RootState, OwnProps, Step | undefined, StepResultType | undefined>(
  (state, props) => {
    const strategyEntry = props.strategyId != null ? state.strategies.strategies[props.strategyId] : undefined;
    const strategy = strategyEntry && strategyEntry.status === 'success' && strategyEntry.strategy;
    const step = props.stepId != null && strategy ? strategy.steps[props.stepId] : undefined;
    return step;
  },
  step => step && { type: 'step', step }
)

function mapState(state: RootState, props: OwnProps): MappedProps {
  const { isOpenedStrategiesVisible } = state.strategyWorkspace;
  const resultType = getResultType(state, props);
  return { isOpenedStrategiesVisible, resultType };
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
        <div style={{ fontSize: '1.2em' }}>
          <p>You have no open strategies. Please run a search to start a strategy.</p>
          <p>To open an existing strategy, visit the <Link to="/workspace/strategies/all">'All' page</Link>.</p>
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
        <div style={{ fontSize: '1.2em' }}>
          <p>You have no open strategies. Please run a search to start a strategy.</p>
          <p>To open an existing strategy, visit the <Link to="/workspace/strategies/all">'All' page</Link>.</p>
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
