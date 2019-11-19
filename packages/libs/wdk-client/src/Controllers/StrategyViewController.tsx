import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { setOpenedStrategiesVisibility } from 'wdk-client/Actions/StrategyWorkspaceActions';
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
import {Omit} from 'wdk-client/Core/CommonTypes';
import InvalidStepResults from 'wdk-client/Views/Strategy/InvalidStepResults';
import ShowAllToggle from 'wdk-client/Views/Strategy/ShowAllToggle';

type StrategyEntry = { strategy?: StrategyDetails, isLoading: boolean; };
type OpenedStrategiesMap = [number, StrategyEntry][];

interface OwnProps {
  strategyId?: number;
  stepId?: number;
  openedStrategies?: number[];
  selectedTab?: string;
  tabId?: string;
}

interface MappedProps {
  isOpenedStrategiesVisible?: boolean;
  resultType?: StepResultType;
  recordClass?: RecordClass;
  selectedStrategy?: StrategyEntry;
  openedStrategies?: OpenedStrategiesMap;
}

interface DispatchProps {
  dispatch: Dispatch
}

type Props = Omit<OwnProps, 'openedStrategies'> & DispatchProps & MappedProps;

const strategyPanelViewId = (strategyId: number) => `strategyPanel__${strategyId}`;

function StrategyViewController(props: Props) {
  const { stepId, strategyId, resultType, recordClass, selectedStrategy, selectedTab, dispatch, openedStrategies, tabId } = props;

  // Track which strategies have been loaded. We only want to load a strategy once per mount.
  const loadedStratsRef = useRef(new Set<number>());

  // Loading strategy
  useEffect(() => {
    if (openedStrategies == null) return;

    for (const [ id ] of openedStrategies) {
      if (loadedStratsRef.current.has(id)) continue;
      loadedStratsRef.current.add(id);
      dispatch(requestStrategy(id));
    }
  }, [openedStrategies]);

  // Select root step if no step is selected
  useEffect(() => {
    if (selectedStrategy && selectedStrategy.strategy && stepId == null) {
      dispatch(transitionToInternalPage(`/workspace/strategies/${selectedStrategy.strategy.strategyId}/${selectedStrategy.strategy.rootStepId}`));
    }
  }, [stepId, strategyId, selectedStrategy]);

  if (openedStrategies == null) return null;

  const isSelectedValid = (
    selectedStrategy &&
    selectedStrategy.strategy &&
    selectedStrategy.strategy.isValid &&
    Object.values(selectedStrategy.strategy.steps).every(step => step.validation.isValid)
  );

  return (
    <>
      {/* <StrategyPanelWithOpenedPanel {...props}/> */}
      <StrategyPanelWithToggle {...props}/>
      <div style={{ position: 'relative', minHeight: '350px' }}>
      { resultType == null ? null
        : isSelectedValid ? (
            <ResultPanelController
            resultType={resultType}
            viewId={`step__${resultType.step.id}`}
            initialTab={selectedTab}
            tabId={tabId}
            renderHeader={() => resultType && recordClass ? (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1em' }}>
                  <ResultPanelHeader
                    reviseViewId={strategyPanelViewId(resultType.step.strategyId)}
                    step={resultType.step}
                    recordClass={recordClass}
                  />
                </div>
                <StepFiltersController
                  step={resultType.step}
                />
              </div>
            ) : null}
          />
        )
        : (
          <InvalidStepResults/>
        )
        }
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

function getStrategyEntry(state: RootState, id?: number): StrategyEntry {
  const entry = id == null ? undefined : state.strategies.strategies[id];
  return entry || { isLoading: true };
}

function mapState(state: RootState, props: OwnProps): MappedProps {
  const { isOpenedStrategiesVisible } = state.strategyWorkspace;
  const resultType = getResultType(state, props);
  const recordClass = getRecordClass(state, resultType);
  const selectedStrategy = getStrategyEntry(state, props.strategyId);
  const openedStrategies = props.openedStrategies && props.openedStrategies.map(id => [id, getStrategyEntry(state, id)]) as OpenedStrategiesMap;
  return { isOpenedStrategiesVisible, resultType, recordClass, selectedStrategy, openedStrategies };
}

export default connect(mapState)(StrategyViewController);

function StrategyPanelWithOpenedPanel(props: Props) {
  const { stepId, strategyId, selectedStrategy, dispatch, openedStrategies, isOpenedStrategiesVisible } = props;
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
        viewId={strategyPanelViewId(strategyId)}
        strategyId={strategyId}
        stepId={stepId}
        strategy={selectedStrategy && selectedStrategy.strategy}
        isLoading={selectedStrategy ? selectedStrategy.isLoading : true}
      />}
    </>
  );
}

function StrategyPanelWithToggle(props: Props) {
  const { stepId, strategyId, dispatch, selectedStrategy,  openedStrategies = [], isOpenedStrategiesVisible } = props;
  const toggleId = "openedStrategiesPanelToggle";
  const strategiesToShow: OpenedStrategiesMap = isOpenedStrategiesVisible ? openedStrategies
    : selectedStrategy && strategyId ? [[ strategyId, selectedStrategy ]]
    : [];

  return (
    <>
      {openedStrategies.length > 1 &&
        <ShowAllToggle
          on={!!isOpenedStrategiesVisible}
          onChange={on => dispatch(setOpenedStrategiesVisibility(on))}
        />
      }
      <div className="OpenedStrategiesPanel">
        {strategiesToShow.map(([id, entry]) => (
          <StrategyPanelController
            key={id}
            isActive={id === strategyId}
            showCloseButton
            viewId={strategyPanelViewId(id)}
            strategyId={id}
            stepId={id === strategyId ? stepId : undefined}
            {...entry}
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
