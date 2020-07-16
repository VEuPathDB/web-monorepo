import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import ResultPanelController from 'wdk-client/Controllers/ResultPanelController';
import {StepFiltersController} from 'wdk-client/Controllers';
import { RootState } from 'wdk-client/Core/State/Types';
import OpenedStrategies from 'wdk-client/Views/Strategy/OpenedStrategies';
import ResultPanelHeader from 'wdk-client/Views/Strategy/ResultPanelHeader';
import { transitionToInternalPage } from 'wdk-client/Actions/RouterActions';
import {Step} from 'wdk-client/Utils/WdkUser';
import {requestStrategy} from 'wdk-client/Actions/StrategyActions';
import {createSelector} from 'reselect';
import {StepResultType} from 'wdk-client/Utils/WdkResult';
import {RecordClass, Question} from 'wdk-client/Utils/WdkModel';
import {Omit} from 'wdk-client/Core/CommonTypes';
import InvalidStepResults from 'wdk-client/Views/Strategy/InvalidStepResults';
import { StrategyEntry } from 'wdk-client/StoreModules/StrategyStoreModule';

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
  question?: Question;
  selectedStrategy?: StrategyEntry;
  openedStrategies?: OpenedStrategiesMap;
}

interface DispatchProps {
  dispatch: Dispatch
}

type Props = Omit<OwnProps, 'openedStrategies'> & DispatchProps & MappedProps;

const strategyPanelViewId = (strategyId: number) => `strategyPanel__${strategyId}`;

function StrategyViewController(props: Props) {
  const { stepId, strategyId, resultType, recordClass, question, selectedStrategy, selectedTab, dispatch, openedStrategies, tabId } = props;

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
    if (selectedStrategy && selectedStrategy.strategy && (stepId == null || !(stepId in selectedStrategy.strategy.steps))) {
      dispatch(
        transitionToInternalPage(
          `/workspace/strategies/${selectedStrategy.strategy.strategyId}/${selectedStrategy.strategy.rootStepId}`,
          { replace: true }
        )
      );
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
      <OpenedStrategies {...props} strategyPanelViewId={strategyPanelViewId}/>
      <div style={{ position: 'relative', minHeight: '350px' }}>
      { resultType == null ? null
        : isSelectedValid ? (
            <ResultPanelController
            resultType={resultType}
            viewId={`step__${resultType.step.id}`}
            initialTab={selectedTab}
            tabId={tabId}
            renderHeader={() => resultType && recordClass && question ? (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1em' }}>
                  <ResultPanelHeader
                    reviseViewId={strategyPanelViewId(resultType.step.strategyId)}
                    step={resultType.step}
                    recordClass={recordClass}
                    question={question}
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

function getQuestion({
  globalData: {
    questions = []
  }
}: RootState, resultType?: StepResultType): Question | undefined {
  if (resultType == null) return;
  return questions.find(question => question.urlSegment === resultType.step.searchName);
}

function getStrategyEntry(state: RootState, id?: number): StrategyEntry {
  const entry = id == null ? undefined : state.strategies.strategies[id];
  return entry || { isLoading: true, hasError: false };
}

function mapState(state: RootState, props: OwnProps): MappedProps {
  const { isOpenedStrategiesVisible } = state.strategyWorkspace;
  const resultType = getResultType(state, props);
  const recordClass = getRecordClass(state, resultType);
  const question = getQuestion(state, resultType);
  const selectedStrategy = getStrategyEntry(state, props.strategyId);
  const openedStrategies = props.openedStrategies && props.openedStrategies.map(id => [id, getStrategyEntry(state, id)]) as OpenedStrategiesMap;
  return { isOpenedStrategiesVisible, resultType, recordClass, question, selectedStrategy, openedStrategies };
}

export default connect(mapState)(StrategyViewController);
