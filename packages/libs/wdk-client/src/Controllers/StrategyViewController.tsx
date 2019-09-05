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
import {Step, StrategyDetails} from 'wdk-client/Utils/WdkUser';
import {requestStrategy} from 'wdk-client/Actions/StrategyActions';
import {createSelector} from 'reselect';
import {StepResultType} from 'wdk-client/Utils/WdkResult';
import {RecordClass} from 'wdk-client/Utils/WdkModel';

interface OwnProps {
  strategyId?: number;
  stepId?: number;
  openedStrategies?: number[];
}

interface MappedProps {
  isOpenedStrategiesVisible?: boolean;
  resultType?: StepResultType;
  recordClass?: RecordClass;
  selectedStrategy?: StrategyDetails;
}

interface DispatchProps {
  dispatch: Dispatch
}

type Props = OwnProps & DispatchProps & MappedProps;

const STRATEGY_PANEL_VIEW_ID = 'activeStrategyPanel';

function StrategyViewController(props: Props) {
  const { stepId, strategyId, resultType, recordClass, selectedStrategy, dispatch, openedStrategies } = props;

  // Loading strategy
  useEffect(() => {
    if (strategyId) {
      dispatch(requestStrategy(strategyId));
    }
  }, [strategyId]);

  // Update active strategy to match what is in the url
  useEffect(() => {
    if (strategyId) dispatch(setActiveStrategy({ strategyId, stepId }));
  }, [strategyId, stepId]);


  // Select root step if no step is selected
  useEffect(() => {
    if (selectedStrategy && stepId == null) {
      dispatch(transitionToInternalPage(`/workspace/strategies/${selectedStrategy.strategyId}/${selectedStrategy.rootStepId}`));
    }
  }, [stepId, strategyId, selectedStrategy]);

  // Select last opened strategy, if no strategy is specified in url
  useEffect(() => {
    if (strategyId == null && openedStrategies) {
      const lastOpened = last(openedStrategies);
      if (lastOpened) {
        dispatch(transitionToInternalPage(`/workspace/strategies/${lastOpened}`));
      }
    }

  }, [strategyId, openedStrategies]);

  if (openedStrategies == null) return null;

  return (
    <>
      {/* <StrategyPanelWithOpenedPanel {...props}/> */}
      <StrategyPanelWithToggle {...props}/>
      <div style={{ position: 'relative', minHeight: '350px' }}>
        {resultType && <ResultPanelController
          resultType={resultType}
          viewId="strategy"
          renderHeader={() => resultType && recordClass ? (
            <>
              <ResultPanelHeader
                reviseViewId={STRATEGY_PANEL_VIEW_ID}
                step={resultType.step}
                recordClass={recordClass}
              />
              <StepFiltersController
                step={resultType.step}
              />
            </>
          ) : null}
        />}
      </div>
    </>
  );
}

const getResultType = createSelector<RootState, OwnProps, Step | undefined, StepResultType | undefined>(
  (state, props) => {
    const strategyEntry = props.strategyId != null ? state.strategies.strategies[props.strategyId] : undefined;
    const strategy = strategyEntry && strategyEntry.strategy;
    const step = props.stepId != null && strategy ? strategy.steps[props.stepId] : undefined;
    return step;
  },
  step => step && { type: 'step', step }
)

function getRecordClass(state: RootState, resultType?: StepResultType): RecordClass | undefined {
  if (resultType == null) return;
  const { recordClasses = [] } = state.globalData;
  return recordClasses.find(rc => rc.urlSegment === resultType.step.recordClassName);
}

function mapState(state: RootState, props: OwnProps): MappedProps {
  const { isOpenedStrategiesVisible } = state.strategyWorkspace;
  const resultType = getResultType(state, props);
  const recordClass = getRecordClass(state, resultType);
  const selectedStrategyEntry = props.strategyId == null ? undefined : state.strategies.strategies[props.strategyId]
  const selectedStrategy = selectedStrategyEntry && selectedStrategyEntry.strategy;
  return { isOpenedStrategiesVisible, resultType, recordClass, selectedStrategy };
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
        <div style={{ textAlign: 'center' }}>
          <input id={toggleId} type="checkbox" checked={isOpenedStrategiesVisible} onChange={event => dispatch(setOpenedStrategiesVisibility(event.target.checked))}/> <label htmlFor={toggleId}>Show all opened strategies</label>
        </div>
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
